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

- Transponder emits: `transponder:position`
- Server broadcasts: `fleet:update` and `fleet:state`
- Dashboard listens for the live fleet state and updates the map

## Notes

- This is a working demo for learning and prototyping.
- It is not production-grade fleet infrastructure.
- Data is kept in memory on the server for the current runtime session.

## Files

- `server.js`
- `transponder.html`
- `dashboard.html`
