(() => {
  if (window.__chessAiOrionLoaded) return;
  window.__chessAiOrionLoaded = true;

  const panelId = "chessai-orion-panel";
  const pieceMap = {
    wp: "P", wn: "N", wb: "B", wr: "R", wq: "Q", wk: "K",
    bp: "p", bn: "n", bb: "b", br: "r", bq: "q", bk: "k",
    wP: "P", wN: "N", wB: "B", wR: "R", wQ: "Q", wK: "K",
    bP: "p", bN: "n", bB: "b", bR: "r", bQ: "q", bK: "k"
  };

  let enabled = true;
  let scheduled = false;

  function boardToFen(board) {
    const squares = Array.from({ length: 8 }, () => Array(8).fill(""));
    let found = 0;

    const pieces = board.querySelectorAll(".piece, [class*='square-'][class*='piece']");
    for (const piece of pieces) {
      const classes = Array.from(piece.classList);
      const pieceCode = classes.map(name => pieceMap[name]).find(Boolean);
      const squareClass = classes.find(name => /^square-[1-8][1-8]$/.test(name));
      if (!pieceCode || !squareClass) continue;

      const match = squareClass.match(/^square-([1-8])([1-8])$/);
      const file = Number(match[1]) - 1;
      const rankIndex = 8 - Number(match[2]);
      squares[rankIndex][file] = pieceCode;
      found++;
    }

    if (!found) return null;
    return squares.map(row => {
      let result = "", empty = 0;
      for (const piece of row) {
        if (!piece) empty++;
        else {
          if (empty) result += empty;
          result += piece;
          empty = 0;
        }
      }
      if (empty) result += empty;
      return result;
    }).join("/");
  }

  function makePanel() {
    if (document.getElementById(panelId)) return;
    const panel = document.createElement("aside");
    panel.id = panelId;
    panel.innerHTML =
      '<div class="chessai-head"><strong>♞ ChessAi Study</strong><button type="button" aria-label="Hide panel">−</button></div>' +
      '<p class="chessai-status">Searching for a chessboard…</p>' +
      '<code class="chessai-fen">Open a Chess.com analysis board.</code>' +
      '<small>Position reader · analysis pages only</small>';
    document.documentElement.appendChild(panel);
    panel.querySelector("button").addEventListener("click", () => {
      panel.classList.toggle("chessai-minimized");
      panel.querySelector("button").textContent =
        panel.classList.contains("chessai-minimized") ? "+" : "−";
    });
  }

  function update() {
    scheduled = false;
    if (!enabled || !document.documentElement) return;
    makePanel();

    const panel = document.getElementById(panelId);
    if (!panel) return;

    const board = document.querySelector("wc-chess-board, chess-board, .board");
    const fen = board ? boardToFen(board) : null;
    const status = panel.querySelector(".chessai-status");
    const output = panel.querySelector(".chessai-fen");
    const nextStatus = fen ? "Board detected" : "No readable board found";
    const nextOutput = fen || "Try opening a position in Chess.com analysis.";

    if (status.textContent !== nextStatus) status.textContent = nextStatus;
    if (output.textContent !== nextOutput) output.textContent = nextOutput;
  }

  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  }

  const style = document.createElement("style");
  style.textContent =
    "#" + panelId + "{position:fixed;z-index:2147483647;right:10px;bottom:12px;width:min(270px,calc(100vw - 20px));box-sizing:border-box;padding:12px;background:#101820;color:#f4f7f8;border:1px solid #2c7774;border-radius:12px;box-shadow:0 8px 30px #0006;font:13px -apple-system,BlinkMacSystemFont, sans-serif}" +
    "#" + panelId + " .chessai-head{display:flex;align-items:center;justify-content:space-between;gap:8px}" +
    "#" + panelId + " strong{color:#69dfd0;font-size:14px}" +
    "#" + panelId + " button{border:0;border-radius:6px;background:#29434a;color:white;font-size:18px;min-width:30px;min-height:28px}" +
    "#" + panelId + " p{margin:8px 0 5px}" +
    "#" + panelId + " code{display:block;overflow-wrap:anywhere;color:#9de8de;font-size:11px;line-height:1.4}" +
    "#" + panelId + " small{display:block;color:#9aabb2;font-size:10px;margin-top:7px}" +
    "#" + panelId + ".chessai-minimized{width:auto;padding:8px}" +
    "#" + panelId + ".chessai-minimized p, #" + panelId + ".chessai-minimized code, #" + panelId + ".chessai-minimized small{display:none}";
  (document.head || document.documentElement).appendChild(style);

  new MutationObserver(scheduleUpdate).observe(document.documentElement, {
    subtree: true, childList: true, attributes: true, attributeFilter: ["class"]
  });
  scheduleUpdate();
})();