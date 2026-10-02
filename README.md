# Tracker

A lightweight vehicle tracking demo built with Node.js, Express, Socket.IO, Leaflet, reverse geocoding, and live news context.

## Overview

This project contains a working browser-based tracking setup:

- `transponder.html` — reads GPS data from the browser and streams telemetry to the server
- `dashboard.html` — connects to the same server and renders assets on a live map
- `server.js` — lightweight Express + Socket.IO backend that relays telemetry in real time

## Features

- Auto-generated IDs in the format `A01`, `A02`, `A03`, etc.
- Multiple transponder devices can register and be tracked simultaneously
- Route history tracking per asset
- Browser-side manual location updates and asset removal
- Reverse geocoded place names and addresses
- News panel that can be opened or closed from the dashboard
- Live fleet monitor panel can be hidden or shown
- Multiple map layers: standard, satellite, and terrain
- Tracked asset list with remove buttons
- Real-time updates from the server without reloading the page

## How it works

1. Install dependencies.
2. Start the tracker server.
3. Open `transponder.html` on a device with location access enabled.
4. Click `Activate Transponder` to generate the next auto-ID.
5. Open `dashboard.html` in another browser tab or device.
6. The dashboard receives live updates from each device in real time.

## Run locally

```bash
npm install
npm start
```

Then open:

- `http://localhost:3000/transponder.html`
- `http://localhost:3000/dashboard.html`

## Socket event flow

- Transponder registers with `transponder:register`; the server acknowledges its ID.
- Transponder emits location updates with `transponder:position`.
- Dashboard sends `dashboard:subscribe` and receives `fleet:state`.
- Dashboard actions use `asset:set-location` and `asset:remove`; the server broadcasts updated `fleet:state`.

## Notes

- This is a working demo for learning and prototyping. Run it through the Node.js server; opening the HTML files directly or using a static file server will not provide Socket.IO.
- It is not production-grade fleet infrastructure.
- Data is kept in memory on the server for the current runtime session.

## Files

- `server.js`
- `transponder.html`
- `dashboard.html`
