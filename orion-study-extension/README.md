# ChessAI Study Helper (Orion / Firefox)

A lightweight Chess.com study extension for computer games, puzzles, studies and analysis.

## Features
- Floating study panel with minimize and compact Focus mode.
- Reads visible piece positions from Chess.com and displays a board preview.
- Separates your selected colour from the side to move.
- Uses explicit board-orientation markers when available; otherwise asks you to confirm White or Black.
- Automatically analyses only when an exact six-field FEN confirms it is your turn.
- If turn metadata is missing, Analyze now can use the visible board placement after you confirm your colour. It clearly labels the selected colour as an assumption.
- Watches for board changes, discards obsolete analysis, and periodically reconciles the page state if Chess.com does not emit a useful DOM event.
- Does not infer whose turn it is from move-list node counts.
- Uses a worker-free local search based on chess.js and a compact evaluation/search routine.

## Using automatic practice analysis
1. Open a Chess.com computer game, puzzle, study or analysis page.
2. Open the ChessAI panel and choose White or Black if the extension cannot identify your colour.
3. Keep the panel open or minimize it; board monitoring continues.
4. When exact turn data confirms it is your turn, the extension starts a local search and displays a suggested legal move.

Automatic analysis is restricted to computer-game, puzzle, analysis and study routes. Live/online game routes are not supported. Automatic suggestions pause when Chess.com does not expose an exact six-field FEN; ChessAI will not guess the side to move.

## Manual analysis when turn data is missing
When the FEN box contains a visible board placement followed by an unknown turn marker (?), select your colour and press Analyze now. The extension assumes your selected colour is to move and labels the result accordingly. Since the page did not provide complete metadata, castling and en-passant rights are treated as unknown and the estimate may differ from the actual game position.

For the most reliable analysis, use a complete six-field FEN. You can also edit the FEN box manually; the chess rules library validates it before searching. The extension preserves your edited FEN while you type; press Read Chess.com board when you want to replace it with the live board position.

## Engine limitations
The engine runs locally in the page and does not require a server or account. It uses iterative deepening, alpha-beta search, move ordering and quiescence search with a bounded node budget. It is not Stockfish and is much weaker than a full modern chess engine; it can miss tactics or deeper plans. Search runs on the page's JavaScript thread and may briefly make the page less responsive. When the board changes, the extension discards the old result and stops before beginning another search depth.

The move-count display stays unavailable unless a trustworthy source exists; the extension does not present raw DOM-node counts as actual chess moves.

## Intended use
Use for puzzles, training, computer practice and post-game study—not live rated games.

## Development checks
The GitHub Actions build runs JavaScript syntax checks and engine smoke tests covering White and Black turns, legal move output, checkmate, stalemate, invalid FEN and search cancellation. The test file is not included in the install package.

## Dependency license
The bundled chess.js library is distributed under the BSD 2-Clause license. Its license text is included as CHESSJS-LICENSE.txt. Source: https://github.com/jhlywa/chess.js

## Install in Orion
1. Open the repository's Actions page: https://github.com/ArxikeGoodboii/ChessAi/actions
2. Open the newest successful Build ChessAI Study Helper run.
3. Download the ChessAI-Study-Helper artifact and extract it.
4. Extract the inner ChessAI-Study-Helper.zip as well if Orion asks for an unpacked extension.
5. Install/select manifest.json from the extracted extension folder.
6. Refresh Chess.com and open the ChessAI Study panel.