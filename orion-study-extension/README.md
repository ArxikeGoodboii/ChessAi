# ChessAI Study Helper (Orion / Firefox)

A lightweight Chess.com study extension for puzzles and post-game review.

## Features
- Floating ChessAI study panel with a minimize control; minimizing does not stop board monitoring.
- Asks you to confirm your colour when board orientation is ambiguous.
- Automatically analyses your turn on recognized computer-game, puzzle and study pages when turn data is available.
- Blocks analysis on live and unsupported game pages.
- Reads piece positions from Chess.com board elements and displays a board preview.
- Best-effort board orientation, turn and move-list detection when Chess.com exposes game data.
- Editable six-field FEN.
- Worker-free local move analysis using a compact JavaScript chess engine based on chess.js.
- Shows a suggested legal move, SAN notation, and a lightweight material/position evaluation.

## Automatic practice analysis
1. Open a Chess.com computer game, puzzle, or study/analysis page.
2. If ChessAI cannot determine your colour, choose White or Black when prompted.
3. Keep the panel open or minimize it; ChessAI continues monitoring the board.
4. When it can confirm it is your turn and has usable position data, it starts analysis and updates the recommendation.

Automatic analysis is deliberately limited to recognized practice/study routes. Live and unsupported game pages are blocked. Turn detection depends on Chess.com exposing move/turn data; if it does not, automatic suggestions wait rather than guessing. You can still use **Analyze now** on supported practice pages.

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
