# ChessAI Study Helper (Orion / Firefox)

A lightweight Chess.com study extension for bot games, puzzles and post-game review.

## Current features
- Floating ChessAI study panel.
- Reads piece positions from Chess.com board elements.
- Displays a board preview and editable FEN.
- Detects board orientation (the side you appear to be playing).
- Best-effort turn and move-list detection when Chess.com exposes game data.
- Shows unknown rather than guessing when turn/history data cannot be read.

## In development
- Reliable full-game reconstruction, including castling and en-passant rights.
- Bundled chess rules and Stockfish analysis.
- Legal move suggestions with highlighted origin/destination squares and explanations.

## Intended use
Use for bot games, puzzles, training and post-game study. Do not use move assistance during live rated games.

## Install in Orion
1. Open the repository's Actions page: https://github.com/ArxikeGoodboii/ChessAi/actions
2. Open the newest successful **Build ChessAI Study Helper** run.
3. Download the **ChessAI-Study-Helper** artifact and extract it.
4. Extract the inner `ChessAI-Study-Helper.zip` as well if Orion asks for an unpacked extension.
5. Install/select `manifest.json` from the extracted extension folder.
6. Refresh Chess.com and open the ChessAI Study panel.
