(() => {
  // Chess.com analysis/review pages only. This helper never runs on live game pages.
  if (window.__chessAiOrionLoaded) return;
  window.__chessAiOrionLoaded = true;

  const PANEL_ID = "chessai-orion-panel";
  const PAGE_URL = "https://arxikegoodboii.github.io/ChessAi/?embedded=1";
  const PIECES = {
    wp:"P",wn:"N",wb:"B",wr:"R",wq:"Q",wk:"K",
    bp:"p",bn:"n",bb:"b",br:"r",bq:"q",bk:"k",
    wP:"P",wN:"N",wB:"B",wR:"R",wQ:"Q",wK:"K",
    bP:"p",bN:"n",bB:"b",bR:"r",bQ:"q",bK:"k"
  };

  let scheduled = false;
  let lastPosition = "";
  let currentBoard = null;
  let arrowSvg = null;

  function getBoard() {
    return document.querySelector("wc-chess-board, chess-board, .board");
  }

  function boardPlacement(board) {
    const ranks = Array.from({length:8}, () => Array(8).fill(""));
    let found = 0;
    for (const el of board.querySelectorAll(".piece, [class*='square-'][class*='piece']")) {
      const classes = Array.from(el.classList);
      const piece = classes.map(c => PIECES[c]).find(Boolean);
      const square = classes.find(c => /^square-[1-8][1-8]$/.test(c));
      if (!piece || !square) continue;
      const match = square.match(/^square-([1-8])([1-8])$/);
      ranks[8 - Number(match[2])][Number(match[1]) - 1] = piece;
      found++;
    }
    if (found < 2) return "";
    return ranks.map(rank => {
      let row = "", empty = 0;
      for (const piece of rank) {
        if (!piece) empty++;
        else {
          if (empty) row += empty;
          row += piece;
          empty = 0;
        }
      }
      if (empty) row += empty;
      return row;
    }).join("/");
  }

  function readPosition(board) {
    const direct = board.getAttribute("fen") ||
      board.getAttribute("data-fen") ||
      board.getAttribute("position");
    if (direct && direct.trim().split(/\s+/).length === 6) {
      return {fen:direct.trim(), estimated:false};
    }
    const placement = boardPlacement(board);
    return placement ? {placement, estimated:true} : null;
  }

  function createPanel() {
    if (document.getElementById(PANEL_ID)) return;
    const panel = document.createElement("aside");
    panel.id = PANEL_ID;
    panel.innerHTML =
      '<div class="chessai-head"><strong>♞ ChessAi · Study</strong>' +
      '<button type="button" aria-label="Minimize panel">−</button></div>' +
      '<p class="chessai-status">Looking for an analysis board…</p>' +
      '<iframe title="ChessAi Stockfish study analysis" src="' + PAGE_URL + '" loading="lazy"></iframe>' +
      '<small>Chess.com analysis and completed-game review</small>';
    document.documentElement.appendChild(panel);

    panel.querySelector("button").addEventListener("click", () => {
      panel.classList.toggle("chessai-min");
      panel.querySelector("button").textContent =
        panel.classList.contains("chessai-min") ? "+" : "−";
    });

    const frame = panel.querySelector("iframe");
    frame.addEventListener("load", () => sendPosition());
  }

  function sendPosition() {
    const panel = document.getElementById(PANEL_ID);
    if (!panel) return;
    const frame = panel.querySelector("iframe");
    if (!frame || !frame.contentWindow || !lastPosition) return;
    frame.contentWindow.postMessage({
      type:"chessai-set-position",
      fen:lastPosition.includes(" ") ? lastPosition : "",
      placement:lastPosition.includes(" ") ? "" : lastPosition,
      estimated:!lastPosition.includes(" ")
    }, "*");
  }

  function isBlackOrientation(board) {
    const cls = (board.className && String(board.className)) || "";
    return /flipped|orientation-black/.test(cls) ||
      !!document.querySelector(".board.flipped, wc-chess-board.flipped, .orientation-black");
  }

  function removeArrow() {
    if (arrowSvg) arrowSvg.remove();
    arrowSvg = null;
  }

  function drawArrow(move) {
    if (!currentBoard || !/^[a-h][1-8][a-h][1-8]/.test(move)) return;
    removeArrow();
    const rect = currentBoard.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const fromFile = move.charCodeAt(0) - 97;
    const fromRank = Number(move[1]) - 1;
    const toFile = move.charCodeAt(2) - 97;
    const toRank = Number(move[3]) - 1;
    const flipped = isBlackOrientation(currentBoard);
    const point = (file, rank) => ({
      x: ((flipped ? 7-file : file) + 0.5) * rect.width / 8,
      y: ((flipped ? rank : 7-rank) + 0.5) * rect.height / 8
    });
    const a = point(fromFile, fromRank), b = point(toFile, toRank);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 " + rect.width + " " + rect.height);
    svg.setAttribute("width", rect.width);
    svg.setAttribute("height", rect.height);
    svg.setAttribute("aria-hidden", "true");
    svg.style.cssText = "position:fixed;left:" + rect.left + "px;top:" + rect.top +
      "px;width:" + rect.width + "px;height:" + rect.height +
      "px;z-index:2147483646;pointer-events:none;overflow:visible";
    const defs = document.createElementNS(svg.namespaceURI, "defs");
    const marker = document.createElementNS(svg.namespaceURI, "marker");
    marker.setAttribute("id", "chessai-arrow-head");
    marker.setAttribute("markerWidth", "8");
    marker.setAttribute("markerHeight", "8");
    marker.setAttribute("refX", "6");
    marker.setAttribute("refY", "3");
    marker.setAttribute("orient", "auto");
    const head = document.createElementNS(svg.namespaceURI, "path");
    head.setAttribute("d", "M0,0 L0,6 L6,3 z");
    head.setAttribute("fill", "#ffe45c");
    marker.appendChild(head);
    defs.appendChild(marker);
    svg.appendChild(defs);

    const line = document.createElementNS(svg.namespaceURI, "line");
    line.setAttribute("x1", a.x);
    line.setAttribute("y1", a.y);
    line.setAttribute("x2", b.x);
    line.setAttribute("y2", b.y);
    line.setAttribute("stroke", "#ffe45c");
    line.setAttribute("stroke-width", Math.max(5, rect.width / 55));
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("marker-end", "url(#chessai-arrow-head)");
    line.setAttribute("opacity", "0.92");
    svg.appendChild(line);
    document.documentElement.appendChild(svg);
    arrowSvg = svg;
  }

  window.addEventListener("message", event => {
    const panel = document.getElementById(PANEL_ID);
    if (!panel || event.source !== panel.querySelector("iframe").contentWindow) return;
    const data = event.data || {};
    if (data.type === "chessai-bestmove" && data.move) {
      drawArrow(data.move);
      const status = panel.querySelector(".chessai-status");
      status.textContent = "Best move: " + data.move.slice(0,2) + " → " + data.move.slice(2,4);
    } else if (data.type === "chessai-engine-status" && data.message) {
      panel.querySelector(".chessai-status").textContent = data.message;
    }
  });

  function update() {
    scheduled = false;
    if (!document.documentElement) return;
    createPanel();
    const panel = document.getElementById(PANEL_ID);
    const board = getBoard();
    const position = board ? readPosition(board) : null;
    const status = panel.querySelector(".chessai-status");

    if (!position) {
      currentBoard = null;
      removeArrow();
      status.textContent = "No readable board found. Open a position in Chess.com Analysis.";
      return;
    }

    currentBoard = board;
    const key = position.fen || position.placement;
    if (key !== lastPosition) {
      lastPosition = key;
      removeArrow();
      status.textContent = position.estimated
        ? "Board detected · confirm whose turn it is in ChessAi"
        : "Board detected · analysing position";
      sendPosition();
    }
    if (arrowSvg) {
      const r = board.getBoundingClientRect();
      arrowSvg.style.left = r.left + "px";
      arrowSvg.style.top = r.top + "px";
      arrowSvg.style.width = r.width + "px";
      arrowSvg.style.height = r.height + "px";
      arrowSvg.setAttribute("viewBox", "0 0 " + r.width + " " + r.height);
    }
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  }

  const style = document.createElement("style");
  style.textContent =
    "#" + PANEL_ID + "{position:fixed;z-index:2147483647;right:10px;bottom:12px;width:min(360px,calc(100vw - 20px));height:min(520px,75vh);box-sizing:border-box;padding:10px;background:#101820;color:#f4f7f8;border:1px solid #2c7774;border-radius:12px;box-shadow:0 8px 30px #0008;font:13px -apple-system,BlinkMacSystemFont,sans-serif;display:flex;flex-direction:column;gap:7px}" +
    "#" + PANEL_ID + " .chessai-head{display:flex;align-items:center;justify-content:space-between}" +
    "#" + PANEL_ID + " strong{color:#69dfd0;font-size:14px}" +
    "#" + PANEL_ID + " button{border:0;border-radius:6px;background:#29434a;color:white;font-size:18px;min-width:30px;min-height:28px}" +
    "#" + PANEL_ID + " p{margin:2px 0;line-height:1.35}" +
    "#" + PANEL_ID + " iframe{border:0;border-radius:8px;background:#0c141b;width:100%;flex:1;min-height:0}" +
    "#" + PANEL_ID + " small{color:#9aabb2;font-size:10px}" +
    "#" + PANEL_ID + ".chessai-min{height:auto;width:auto;padding:8px}" +
    "#" + PANEL_ID + ".chessai-min p,#" + PANEL_ID + ".chessai-min iframe,#" + PANEL_ID + ".chessai-min small{display:none}";
  (document.head || document.documentElement).appendChild(style);

  new MutationObserver(schedule).observe(document.documentElement, {
    subtree:true, childList:true, attributes:true,
    attributeFilter:["class","fen","data-fen","position"]
  });
  window.addEventListener("resize", schedule);
  window.addEventListener("scroll", schedule, true);
  schedule();
})();