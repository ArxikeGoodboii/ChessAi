# Changelog

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
