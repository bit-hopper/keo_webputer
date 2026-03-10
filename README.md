> ⚠️ **EXPERIMENTAL - NOT PRODUCTION READY**  
> This project is an experimental proof of concept. It should only be used for testing and development purposes. Use at your own risk. Do not use with real funds or in production environments.

# Keo Webputer

A real-time decentralized web multi-user collaborative workspace with native currency integration, built on Croquet's Virtual DOM framework.

## Key Features

- **Collaborative Whiteboard** - Real-time synchronized drawing and document sharing
- **Starknet Wallet** - Connect to Starknet Sepolia, view KEO token balance
- **KEO Token** - ERC20 smart contract on Starknet Sepolia
- **Media Support** - Audio/video playback, screen sharing, video conferencing
- **IPFS Integration** - Decentralized content sharing with CID generation
- **3D Worlds** - Interactive portal viewer via Microverse
- **Web Apps** - Embed arbitrary web content with MiniBrowser

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start development server:**

   ```bash
   npm start
   # or
   node server.js
   ```

3. **Open in browser:**
   - Main app: `http://localhost:8000`

## Project Structure

```
├── index.html                 # Main application
├── landing.html              # Onboarding page
├── src/
│   ├── pitch.js             # Collaborative whiteboard
│   ├── dweb-app.js          # IPFS/CID integration
│   ├── media-player.js      # Media playback
│   ├── minibrowser.js       # Web app embedding
│   └── ...
├── wallet/                   # Starknet wallet UI
├── dweb-app/                # IPFS app
├── share-screen/            # Screen sharing
├── portal/                   # 3D worlds
└── croquet/                 # Croquet framework
```

## Tech Stack

- **Framework**: Croquet Virtual DOM (real-time sync)
- **Web3/Currency**: Starknet.js, Cairo 2.0
- **Storage**: IPFS (@helia/verified-fetch)
- **Video/Audio**: Agora SDK
- **Build**: Rollup, Babel

## Starknet Contract

**KEO Token** - ERC20 on Starknet Sepolia

- Address: `0x01024a2751a749b4586b5dc2899a8c38bff389c2b319dcfe963d5f181d2b9e62`
- Supply: 1 billion tokens (18 decimals)
- Owner-only mint/burn

## License

Copyright 2021 Croquet Corporation.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
