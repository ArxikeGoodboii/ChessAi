# ChessAI Study Helper (Orion / Firefox)

A lightweight Chess.com study extension for computer games, puzzles, studies and analysis.

## Features
- Floating ChessAI study panel with a minimize control; minimizing does not stop board monitoring.
- Uses explicit board-orientation markers when available; otherwise asks you to confirm your colour.
- Automatically analyses your turn on computer-game, puzzle, analysis and study pages only when exact turn data is available.
- Blocks analysis on live and unsupported game pages.
- Reads piece positions from Chess.com board elements and displays a board preview.
- Uses only exact six-field FEN for turn detection; never guesses the side to move from move-list element counts.
- Editable six-field FEN.
- Worker-free local move analysis using a compact JavaScript chess engine based on chess.js.
- Shows a suggested legal move, SAN notation, and a lightweight material/position evaluation.

## Automatic practice analysis
1. Open a Chess.com computer game, puzzle, or study/analysis page.
2. If ChessAI cannot determine your colour, choose White or Black when prompted.
3. Keep the panel open or minimize it; ChessAI continues monitoring the board.
4. When it can confirm it is your turn and has usable position data, it starts analysis and updates the recommendation.

Automatic analysis is limited to computer-game, puzzle, analysis and study routes. Live/online game routes are not supported. Turn detection requires an exact six-field FEN; if Chess.com does not expose it, automatic suggestions pause rather than guessing. The FEN box displays `?` for an unknown turn; enter a valid six-field FEN before using **Analyze now**.

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
