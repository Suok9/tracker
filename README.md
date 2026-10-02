# Tracker

A lightweight vehicle tracking demo built with plain HTML, JavaScript, MQTT, and Leaflet.

## Overview

This project contains two browser-based apps:

- `transponder.html` — simulates a vehicle transponder that reads the browser GPS location and publishes telemetry to an MQTT topic.
- `dashboard.html` — subscribes to the same MQTT topic and displays the asset on a live map.

## How it works

1. Open `transponder.html` on a device with location access enabled.
2. Click `Activate Transponder`.
3. The browser sends GPS coordinates to the MQTT topic `emapping/transponder/telemetry`.
4. Open `dashboard.html` in another tab or browser.
5. The dashboard listens for telemetry and updates the vehicle marker in real time.

## Required access

- GPS permission must be allowed in the browser.
- A public MQTT broker is used for communication.

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

## Notes

- This is a demo for learning and prototyping.
- It is not production-grade tracking infrastructure.
- The transponder currently identifies itself as `asset-vehicle-01`.

## Files

- `transponder.html`
- `dashboard.html`
