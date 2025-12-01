# BCH Hacker Dashboard Implementation

## Overview
Created a retro "hacker-style" dashboard for tracking Bitcoin Cash (BCH) and other cryptocurrencies in real-time.

## Features
1.  **Real-time BCH Chart**:
    - Uses Binance WebSocket (`wss://stream.binance.com:9443/ws/bchusdt@trade`) for live trade data.
    - Visualized with `recharts` in a neon green line chart.
    - Updates instantly as trades occur.

2.  **Live Ticker**:
    - Scrolling marquee at the bottom.
    - Tracks BCH, BTC, ETH, XMR (Monero), DOGE, RONIN.
    - Uses Binance WebSocket for real-time price updates.
    - Shows price and percentage change with up/down arrows.

3.  **Info Panel**:
    - Fetches detailed BCH data from CoinGecko API.
    - Displays Rank, Market Cap, Volume, Circulating Supply, 24h High/Low.
    - Auto-refreshes every minute.

4.  **Hacker Aesthetic**:
    - **Visuals**: Neon green text (`#0f0`) on black background.
    - **Effects**: CRT scanlines overlay, text glow, flickering animations.
    - **Font**: Monospace (`Courier New`).
    - **Layout**: Grid-based dashboard simulating multiple terminal windows.
    - **Terminal**: Simulated system logs with scrolling text.

## Tech Stack
- **Framework**: React (Vite) + TypeScript
- **Styling**: Vanilla CSS (CSS Variables, Grid, Animations)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Data**: Binance WebSockets, CoinGecko API

## How to Run
The application is currently running at:
**http://localhost:5174/**

If you need to restart it:
```bash
cd crypto-hacker-dashboard
npm run dev
```
