# ChessAI Study Helper (Orion / Firefox)

A small Manifest V3 browser extension for Chess.com post-game review and practice.

## Current features
- Adds a floating **ChessAI Study** button on Chess.com.
- Opens a compact study panel.
- Accepts a FEN position and renders it as a chessboard.
- Validates the eight FEN board ranks and piece symbols.

## Not included yet
- No Stockfish engine.
- No automatic reading of the Chess.com board.
- No move recommendations.
- It is intended for review and practice, not live competitive-game assistance.

## Install in Orion
1. Download the `orion-study-extension` folder as a ZIP from GitHub (or download the repository ZIP).
2. If Orion's importer asks for a manifest, select `orion-study-extension/manifest.json`.
3. Enable the extension and open or refresh Chess.com.
4. Tap **ChessAI Study** in the lower-right corner.
5. Paste a FEN into the box and tap **Show position**.

If Orion only accepts a single manifest file, use the folder ZIP rather than downloading the manifest by itself: the manifest needs `content.js` alongside it.
