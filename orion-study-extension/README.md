# ChessAI Study Helper (Orion / Firefox)

A lightweight Chess.com study extension for puzzles and post-game review.

## Current features
- Floating ChessAI study panel.
- Reads piece positions from Chess.com board elements.
- Displays a board preview and editable FEN.
- Detects board orientation (the side you appear to be playing).
- Best-effort turn and move-list detection when Chess.com exposes game data.
- Bundles Stockfish 19 lite single-threaded for analysis of study positions.
- Shows the engine's top move as a piece and from-to squares.

## Analyze a study position
1. Open a puzzle or a completed game's analysis position.
2. Ensure the FEN box contains a complete six-field FEN, including side to move, castling rights and en-passant square.
3. Tap **Analyze study position**.
4. Wait for Stockfish to return its top move.

The extension intentionally does not guess missing FEN fields. If Chess.com only exposes piece placement, use a complete FEN from a study position before analyzing. Engine move output is an evaluation aid, not a guarantee of a winning move.

## Intended use
Use for puzzles, training and post-game study—not live rated games.

## Engine license
Stockfish.js 19 is distributed under GPL-3.0. The accompanying license text is included as `STOCKFISH-LICENSE.txt`. Source: https://github.com/nmrugg/stockfish.js

## Install in Orion
1. Open the repository's Actions page: https://github.com/ArxikeGoodboii/ChessAi/actions
2. Open the newest successful **Build ChessAI Study Helper** run.
3. Download the **ChessAI-Study-Helper** artifact and extract it.
4. Extract the inner `ChessAI-Study-Helper.zip` as well if Orion asks for an unpacked extension.
5. Install/select `manifest.json` from the extracted extension folder.
6. Refresh Chess.com and open the ChessAI Study panel.
