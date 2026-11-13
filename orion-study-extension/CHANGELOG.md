# Changelog

## 1.4.8
- Discards in-progress suggestions when the detected board position changes.
- Cancels obsolete searches between iterative-deepening depths.
- Rechecks the live board before displaying automatic or assumed-turn results.
- Expands DOM observation and adds a low-frequency page-state reconciliation check.
- Prioritizes the largest visible board when reading FEN metadata.
- Preserves manually edited FEN while polling the live board and reads orientation markers across shadow-DOM boundaries.
- Removes misleading move counts derived from rendered DOM node totals.
- Adds automated engine smoke tests and runs them before packaging.
- Documents the manual fallback when a complete turn field is unavailable.


## 1.4.6
- Reduced the compact move window to a small 172px-wide, 68px-high panel.
- Added an always-accessible Focus/Expand button at the top of the screen while the panel is open.
- Improved move search with iterative deepening up to depth 5, capture/check ordering, and quiescence search to examine tactical sequences more carefully.
- Keeps the last fully completed search depth if a deeper search reaches its node budget.

## 1.4.5
- Only analyze when the confirmed player's colour is the side to move.
- Manual analysis now waits for the player's turn instead of suggesting the opponent's move.
- Added Focus mode: a compact floating window that shows only the suggested move, with an expand control.

## 1.0.0
- First separate Orion/Firefox extension build.
- Floating Chess.com study panel.
- FEN validation and chessboard position display.


## 1.1.0
- Improved Chess.com board detection by searching open shadow roots.
- Added automatic side recognition from the board's flipped orientation.
- Added clearer diagnostics when the board cannot be detected.


## 1.2.0
- Added best-effort turn detection from full FEN or move-list progress.
- Added move-list text and move-count display.
- Kept board orientation (your side) separate from whose turn it is.
- Added explicit unknown states when Chess.com does not expose enough game data.


## 1.3.0
- Added a Stockfish 19 lite single-threaded engine to the build artifact.
- Added a study-position analysis button that displays the engine's best move in UCI coordinates and identifies the moving piece.
- Requires a complete six-field FEN; does not guess missing castling or en-passant rights.
- Stockfish is distributed under GPL-3.0; see STOCKFISH-LICENSE.txt in the package.


## 1.4.0
- Removed the Web Worker and WASM engine startup path for Orion compatibility.
- Bundles a small JavaScript chess rules library and a lightweight local search engine.
- Adds legal-move suggestions with SAN and a basic position evaluation.
- Analysis is depth-limited and runs on the page thread; it is intended for puzzles and post-game study.


## 1.4.1
- Fixed whitespace parsing of FEN fields so valid six-field positions are accepted.
- Corrected the reported completed search depth.
- Clarified the panel's analysis description.


## 1.4.3
- Added a colour confirmation prompt when board orientation is ambiguous.
- Added automatic analysis on recognized computer-game, puzzle and study/analysis pages when it is the user's turn and turn data is available.
- Added a minimize control; monitoring continues while the panel is hidden.
- Blocks manual and automatic analysis on live or unsupported game pages.
- Resets the confirmed colour when a new game position is detected.


## 1.4.4
- Stops assuming an unflipped board means White; asks for manual colour confirmation when orientation is not explicit.
- Keeps a manually confirmed colour from being overwritten by automatic detection during the game.
- Broadens analysis availability to Chess.com pages instead of relying on a short list of URL paths.


## 1.4.7
- Removed unreliable turn guessing from move-list DOM counts and stopped defaulting unknown turn to White.
- Requires exact six-field FEN turn data for automatic analysis.
- Improved orientation marker search and never assumes an unflipped board means White.
- Filters invisible pieces and prefers pieces inside the largest visible board.
- Restricts supported pages to computer games, puzzles, analysis and study routes; online/live routes are not supported.
- Fixed quiescence handling at the in-check search horizon.
