"""Minimal client for a Samsung Tizen TV's developer connection (sdb, port 26101).

It speaks the adb-style protocol directly, so it works even when the Tizen
Studio `sdb` tool misbehaves. The TV must be in developer mode with this
computer's IP address set as the Host PC IP.
"""
import os
import socket
import struct
import time

PORT = 26101
TMP_DIR = '/home/owner/share/tmp/sdk_tools/tmp/'

CNXN, OPEN, OKAY, WRTE, CLSE = [struct.unpack('<I', x)[0] for x in (b'CNXN', b'OPEN', b'OKAY', b'WRTE', b'CLSE')]


def _pkt(cmd, a0, a1, data=b''):
    return struct.pack('<6I', cmd, a0, a1, len(data), sum(data) & 0xffffffff, cmd ^ 0xffffffff) + data


class TV:
    """One developer connection to a TV."""

    def __init__(self, host, timeout=30):
        self.host = host
        self.s = socket.create_connection((host, PORT), timeout=timeout)
        self.next_id = 1
        self.s.sendall(_pkt(CNXN, 0x02000000, 256 * 1024, b'host::\x00'))
        cmd, _, maxdata, data = self._read()
        if cmd != CNXN:
            raise ConnectionError('TV did not accept the developer connection')
        self.maxdata = maxdata
        self.device = data.rstrip(b'\x00').decode(errors='replace')

    def close(self):
        try:
            self.s.close()
        except OSError:
            pass

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self.close()

    # ---- low level ----
    def _recv_exact(self, n):
        b = b''
        while len(b) < n:
            c = self.s.recv(n - len(b))
            if not c:
                raise EOFError('connection closed by the TV')
            b += c
        return b

    def _read(self):
        cmd, a0, a1, ln, _, _ = struct.unpack('<6I', self._recv_exact(24))
        return cmd, a0, a1, (self._recv_exact(ln) if ln else b'')

    def _open(self, service):
        lid = self.next_id
        self.next_id += 1
        self.s.sendall(_pkt(OPEN, lid, 0, service.encode() + b'\x00'))
        while True:
            cmd, a0, a1, _ = self._read()
            if cmd == OKAY and a1 == lid:
                return lid, a0
            if cmd == CLSE and a1 == lid:
                raise RuntimeError('TV refused: ' + service)
            # anything else belongs to an earlier stream

    def _write(self, lid, rid, data):
        self.s.sendall(_pkt(WRTE, lid, rid, data))
        while True:
            cmd, _, _, _ = self._read()
            if cmd == OKAY:
                return
            if cmd == WRTE:
                self.s.sendall(_pkt(OKAY, lid, rid))
            if cmd == CLSE:
                raise RuntimeError('stream closed during write')

    # ---- operations ----
    def shell(self, command):
        """Run a TV shell command (e.g. '0 applist') and return its output."""
        lid, rid = self._open('shell:' + command)
        out = b''
        while True:
            cmd, _, a1, d = self._read()
            if cmd == WRTE and a1 == lid:
                out += d
                self.s.sendall(_pkt(OKAY, lid, rid))
            elif cmd == CLSE and a1 == lid:
                self.s.sendall(_pkt(CLSE, lid, rid))
                return out.decode(errors='replace')

    def push(self, local_path, remote_path):
        """Copy a file to the TV. Returns True on success."""
        lid, rid = self._open('sync:')
        payload = open(local_path, 'rb').read()
        limit = self.maxdata - 64
        target = ('%s,%d' % (remote_path, 0o100644)).encode()
        buf = b'SEND' + struct.pack('<I', len(target)) + target
        for i in range(0, len(payload), 32 * 1024):
            part = payload[i:i + 32 * 1024]
            buf += b'DATA' + struct.pack('<I', len(part)) + part
            while len(buf) >= limit:
                self._write(lid, rid, buf[:limit])
                buf = buf[limit:]
        buf += b'DONE' + struct.pack('<I', int(time.time()))
        while buf:
            self._write(lid, rid, buf[:limit])
            buf = buf[limit:]
        status = b''
        while len(status) < 8:
            cmd, _, _, d = self._read()
            if cmd == WRTE:
                status += d
                self.s.sendall(_pkt(OKAY, lid, rid))
            elif cmd == CLSE:
                break
        self.s.sendall(_pkt(WRTE, lid, rid, b'QUIT' + struct.pack('<I', 0)))
        self.s.sendall(_pkt(CLSE, lid, rid))
        return status[:4] == b'OKAY'

    def install(self, wgt_path, app_id):
        """Push a signed .wgt and install it. Returns the installer's output."""
        remote = TMP_DIR + os.path.basename(wgt_path)
        if not self.push(wgt_path, remote):
            raise RuntimeError('upload to the TV failed')
        return self.shell('0 vd_appinstall %s %s' % (app_id, remote))

    def launch(self, app_id):
        return self.shell('0 was_execute %s' % app_id)

    def duid(self):
        """The TV's device ID, needed for the Samsung distributor certificate."""
        return self.shell('0 getduid').strip()

    def capability(self):
        return self.shell('capability')
