# 0006. Use keyless services for weather and location

- **Status:** Accepted
- **Date:** 2026-11-05

## Context

The app needs current weather, a short forecast, and sunrise and sunset times, plus a way to set the location from a UK postcode on the TV. Keys and accounts are a burden to manage across TVs.

## Decision

Use **Open-Meteo** for weather, the forecast, and sunrise and sunset, and **postcodes.io** for postcode lookup. Both are free and need no key. Requests go straight from the TV.

## Consequences

- There's nothing secret to store or rotate.
- Both are third-party services that could change or limit. If they fail, the app shows "Forecast unavailable", and the scene falls back to default sun times.
- Open-Meteo's free tier is for non-commercial use, which fits.

## Alternatives considered

- **Met Office DataHub:** needs an account and a key.
