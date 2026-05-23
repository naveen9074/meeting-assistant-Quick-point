# QuickStart for QuickPoint

## Prerequisites
- Node.js (v18+)
- npm (comes with Node)
- Rust toolchain (for Tauri): `rustup target add x86_64-pc-windows-msvc`
- Cargo (installed with Rust)

## Setup
```bash
# install JS dependencies
npm install

# install Rust dependencies (handled by Tauri automatically)
```

## Development
```bash
npm run dev
```
This starts the React dev server and launches the Tauri window.

## Build for production
```bash
npm run build   # builds the React bundle
cargo tauri build   # creates the native installer
```

## Running the built app
The installer will be generated under `src-tauri/target/release`.

---
The logo automatically switches based on system theme (light uses `qlogo.png`, dark uses `qtranperantlogo.png`).
