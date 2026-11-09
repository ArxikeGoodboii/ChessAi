ChessAi Orion Study Helper

SETUP
1. In your GitHub repository, open Settings -> Pages.
2. Under Build and deployment -> Source, select "GitHub Actions".
3. Open Actions -> "Publish ChessAi Orion study page" -> Run workflow (choose chrome-extension).
4. Wait for the workflow to finish, then open the Pages URL shown in the deployment.
5. In Chess.com Analysis or a completed game's review, copy the FEN position and paste it into ChessAi. Tap Analyse position.

The page runs Stockfish 19 Lite single-threaded in a same-origin Web Worker. The workflow downloads the matching JavaScript and WebAssembly files from the stockfish 19.0.1 npm package during deployment.

LIMITATIONS
- First version uses manual FEN input. Automatic reading of the Chess.com mobile board is not implemented yet.
- Use for post-game review and study, not live rated-game assistance.
- Stockfish.js is GPL-3.0: https://github.com/nmrugg/stockfish.js
