# ChessAI Study Helper (Orion / Firefox)

A lightweight Chess.com study extension for puzzles and post-game review.

## Features
- Floating ChessAI study panel.
- Reads piece positions from Chess.com board elements and displays a board preview.
- Best-effort board orientation, turn and move-list detection when Chess.com exposes game data.
- Editable six-field FEN.
- Worker-free local move analysis using a compact JavaScript chess engine based on chess.js.
- Shows a suggested legal move, SAN notation, and a lightweight material/position evaluation.

## Analyze a study position
1. Open a puzzle or a completed game's analysis position.
2. Check that the FEN box contains the correct complete six-field FEN.
3. Tap **Analyze study position** and wait for the local search to finish.

The local search is deliberately lightweight and limited to a shallow depth. It is not Stockfish and its suggestion may be weaker or miss deeper tactics. Because it runs on the page's main JavaScript thread, the page may pause briefly during analysis. The extension does not invent castling or en-passant rights.

## Intended use
Use for puzzles, training and post-game study—not live rated games.

## Dependency license
The bundled chess.js library is distributed under the BSD 2-Clause license. Its license text is included as `CHESSJS-LICENSE.txt`. Source: https://github.com/jhlywa/chess.js

## Install in Orion
1. Open the repository's Actions page: https://github.com/ArxikeGoodboii/ChessAi/actions
2. Open the newest successful **Build ChessAI Study Helper** run.
3. Download the **ChessAI-Study-Helper** artifact and extract it.
4. Extract the inner `ChessAI-Study-Helper.zip` as well if Orion asks for an unpacked extension.
5. Install/select `manifest.json` from the extracted extension folder.
6. Refresh Chess.com and open the ChessAI Study panel.
