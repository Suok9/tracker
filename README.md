# Tracker

A lightweight vehicle tracking demo built with plain HTML, JavaScript, MQTT, Leaflet, OpenStreetMap reverse geocoding, and live news context.

## Overview

This project contains two browser-based apps:

- `transponder.html` — simulates a vehicle transponder that reads the browser GPS location and publishes telemetry to an MQTT topic.
- `dashboard.html` — subscribes to the same MQTT topic and displays the asset on a live map with route history, location context, and related headline news.

## How it works

1. Open `transponder.html` on a device with location access enabled.
2. Click `Activate Transponder`.
3. The browser sends GPS coordinates to the MQTT topic `emapping/transponder/telemetry`.
4. Open `dashboard.html` in another tab or browser.
5. The dashboard listens for telemetry, tracks the route, resolves the location, and shows live news context.

## Required access

- GPS permission must be allowed in the browser.
- A public MQTT broker is used for communication.
- Reverse geocoding and live news feeds depend on third-party public services available from the browser.

## Run locally

Because these files are static HTML pages, you can either:

- open them directly in a browser, or
- serve the repository locally with a simple web server.

Example using Python:

```bash
cd tracker
python -m http.server 8000
```

Then open:

- `http://localhost:8000/transponder.html`
- `http://localhost:8000/dashboard.html`

## MQTT topic

```text
emapping/transponder/telemetry
```

## Included features

- Live GPS telemetry
- Real-time map tracking
- Route history tracking
- Reverse geocoded place context
- Related news headlines from a public RSS feed

## Notes

- This is a demo for learning and prototyping.
- It is not production-grade tracking infrastructure.
- The transponder identifies itself as `asset-vehicle-01`.
- Third-party services may be rate-limited or unavailable depending on browser/network conditions.

## Files

- `transponder.html`
- `dashboard.html`
