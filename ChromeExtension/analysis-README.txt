ChessAi Orion Study Helper

1. Open analysis.html in a browser tab (after publishing the repository as a static site).
2. Copy a complete FEN position from Chess.com Analysis / game review.
3. Paste it into the FEN box and tap Analyse position.
4. Stockfish returns a best move in UCI notation (for example e2 → e4).

Important:
- This first working milestone is manual-FEN analysis. Automatic reading of the Chess.com mobile board is not implemented yet.
- Stockfish is loaded from jsDelivr, so internet access is required.
- This is for post-game review and study, not live rated-game assistance.
- The Stockfish package is GPL-3.0. See https://github.com/nmrugg/stockfish.js and https://www.npmjs.com/package/stockfish.
- Orion/iOS support for blob workers and third-party worker scripts can vary. Test in Orion; if blocked, the engine page will show an error rather than silently pretending to work.
