# Trailer Lights

A real-time, peer-to-peer trailer light system that turns phones into wireless brake lights and turn signals. One phone in the cab acts as the **Controller**, while phones mounted on the trailer act as **Receivers** — displaying full-screen colors in response to the driver's commands.

No hardware required. No subscription. Just phones you already have.

---

## How It Works

The driver opens the app on their phone (the one with a data plan) and selects **Controller**. A 5-character room code is generated. Receiver phones connect to the controller's mobile hotspot, open the same URL, select **Receiver**, choose their side (Left or Right), and enter the room code.

Communication happens over **WebRTC via PeerJS**. The PeerJS cloud signaling server brokers the initial handshake (a few kilobytes), then all data flows directly peer-to-peer. The messages are tiny JSON payloads — light state updates and keep-alive pings.

## Features

### Free

- **Brake** — both receivers show solid bright red
- **Left / Right Turn Signal** — corresponding receiver blinks amber; operates independently of brake (brake + turn work simultaneously)
- **Toggle controls** — tap to activate, tap again to deactivate
- **Auto-reconnect** — receivers detect connection drops and reconnect automatically with exponential backoff
- **Wake Lock** — prevents screen sleep on both controller and receiver
- **Keep-alive pings** — heartbeat every 3 seconds with health monitoring
- **Device identification** — controller shows each connected receiver by side (LEFT / RIGHT) with live health status
- **Fullscreen** — receiver auto-enters fullscreen on connect; controller has a manual toggle
- **Session timer** — uptime counter on the controller

### Pro (unlocked via Licensing)

- **Hazard** — both receivers blink red simultaneously
- **Driving Lights** — both receivers show dim dark red for nighttime visibility
- **Reverse** — both receivers show solid white
- **Custom Colors** — reassign the color of any mode (brake, turn signals, hazard, driving, reverse) with preset swatches or a full color picker; persists across sessions
- **Trailer Visual** — live SVG rendering of the trailer rear with glowing lights that mirror the current state in real time

## Tech Stack

- **React** (Vite) — single-page app, no backend
- **PeerJS 1.5.4** — WebRTC data channels for peer-to-peer communication
- **Web APIs** — Wake Lock, Fullscreen, Web Crypto (SHA-256 for code validation)
- **localStorage** — Pro unlock status and custom color persistence

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
git clone https://github.com/YOUR_USERNAME/trailer-lights.git
cd trailer-lights
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for Production

```bash
npm run build
```

The `dist/` folder contains static files ready to deploy anywhere.

### Deploy

This is a fully static app — no server process needed. Upload the contents of `dist/` to any web host.

**Vite config** — set the `base` path in `vite.config.js` to match your deployment path:

```js
export default defineConfig({
  plugins: [react()],
  base: '/your-path/',
})
```

### PWA / Add to Home Screen

For the best experience (especially on iOS where the Fullscreen API isn't supported on iPhones), users can add the app to their home screen for a standalone, chromeless experience.

The repo includes:
- `manifest.json` — web app manifest with standalone display mode
- `icon-192.png` / `icon-512.png` — app icons

Add these to your `public/` folder and include in `index.html`:

```html
<link rel="manifest" href="/your-path/manifest.json">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="theme-color" content="#0a0a0a">
<link rel="apple-touch-icon" href="/your-path/icon-192.png">
```

## Pro Unlock System

Pro features are gated behind a SHA-256 hash-based code validation system. Codes are generated offline and sold via Gumroad. Only the hashes are shipped in the app — codes themselves never appear in the source.

### Generating Codes

Use the included utility (keep this local, never deploy it):

```bash
# Generate 20 new codes with their hashes
node generate-codes.js generate 20

# Hash a specific code
node generate-codes.js hash TRAIL-ABC12

# Batch hash codes from a file
node generate-codes.js batch codes.txt
```

### Adding Codes to the App

1. Run `generate-codes.js generate N`
2. Copy the hash strings into the `VALID_HASHES` Set in `App.jsx`
3. Upload the plain-text codes to your Gumroad product
4. Rebuild and redeploy

## Usage Tips

- **Hotspot setup** — the controller phone provides the hotspot. Receiver phones connect to it via WiFi. Only the initial PeerJS handshake needs internet; after that, communication is local P2P.
- **Highway use** — at highway speeds, cell tower handoffs can briefly interrupt the hotspot. The auto-reconnect system handles this automatically. Disabling "Wi-Fi Assist" (iOS) or "Switch to mobile data" (Android) can reduce these interruptions.
- **Screen brightness** — crank receiver phones to max brightness for best visibility.
- **Mounting** — mount receiver phones facing rearward on the trailer with the screen visible to following traffic.

## Connection Architecture

```
┌──────────────┐         PeerJS Cloud          ┌──────────────┐
│  CONTROLLER   │◄──── signaling handshake ────►│   RECEIVER   │
│  (cab phone)  │                               │  (trailer L) │
│               │◄──── P2P data channel ───────►│              │
└──────────────┘           (local)              └──────────────┘
       │                                        ┌──────────────┐
       │◄──────── P2P data channel ────────────►│   RECEIVER   │
                       (local)                  │  (trailer R) │
                                                └──────────────┘
```

## Project Structure

```
trailer-lights/
├── public/
│   ├── manifest.json
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   └── App.jsx            # Entire app (Controller + Receiver)
├── generate-codes.js       # Pro code generator (local only)
├── vite.config.js
└── package.json
```

## License

MIT

---

Built with phones, for phones.
