(() => {
  if (window.__chessAIStudyHelperLoaded) return;
  window.__chessAIStudyHelperLoaded = true;

  const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1";
  const host = document.createElement("div");
  host.id = "chessai-study-helper-host";
  document.documentElement.appendChild(host);
  const root = host.attachShadow({ mode: "open" });
  const css = document.createElement("style");
  css.textContent = `
    :host { all: initial; } * { box-sizing: border-box; }
    .launcher { position:fixed;right:16px;bottom:22px;z-index:2147483647;border:0;border-radius:999px;padding:12px 17px;color:white;background:#242b38;font:700 14px system-ui;box-shadow:0 5px 22px #0005;cursor:pointer; }
    .panel { position:fixed;right:16px;bottom:76px;z-index:2147483647;width:min(340px,calc(100vw - 24px));max-height:min(76vh,680px);overflow:auto;border:1px solid #394252;border-radius:16px;background:#171c25;color:#f3f5f8;box-shadow:0 12px 40px #0008;font:14px/1.45 system-ui,sans-serif; }
    .hidden { display:none; } header { display:flex;justify-content:space-between;align-items:center;padding:13px 15px;background:#222a36;border-radius:16px 16px 0 0; }
    .focus-toggle{border:1px solid #526078;border-radius:8px;padding:6px 9px;background:#273246;color:#fff;font:700 12px system-ui;cursor:pointer}.panel.focus{width:min(220px,calc(100vw - 24px));max-height:150px;bottom:22px;border-radius:12px}.panel.focus header{display:none}.panel.focus .body{padding:10px}.panel.focus .body>*:not(#recommend){display:none!important}.panel.focus #recommend{display:block;margin:0;padding:0;border:0;background:transparent}.panel.focus #recommend strong,.panel.focus #recommend .detail{display:none}.panel.focus #recommend .best{display:block;padding:8px 30px 8px 4px;font-size:18px;font-weight:800;line-height:1.25;color:#fff}.panel.focus .expand-focus{display:block}.expand-focus{display:none;position:absolute;right:8px;top:8px;border:0;border-radius:6px;padding:4px 7px;background:#303b4c;color:#fff;font-size:16px;cursor:pointer}
    header strong {font-size:15px}.close{border:0;color:#dce2ec;background:transparent;font-size:22px;cursor:pointer}.side-choice{border:1px solid #526078;border-radius:8px;padding:7px 11px;background:#273246;color:#fff;font-weight:700;cursor:pointer}.muted{color:#aeb9c9;font-size:12px}.body{padding:14px}
    .hint{margin:0 0 10px;color:#b7c0ce;font-size:12px}label{display:block;margin:9px 0 5px;color:#dce2ec;font-size:12px;font-weight:700}
    textarea{display:block;width:100%;min-height:76px;resize:vertical;border:1px solid #465164;border-radius:9px;padding:9px;background:#0f131a;color:#f3f5f8;font:12px/1.4 ui-monospace,monospace}
    button.action{border:0;border-radius:9px;padding:9px 12px;background:#7c9cff;color:#101522;font-weight:700;cursor:pointer}.row{display:flex;gap:8px;align-items:center;margin-top:9px;flex-wrap:wrap}
    .status{min-height:18px;color:#aeb9c9;font-size:12px}.board{display:grid;grid-template-columns:repeat(8,1fr);width:100%;aspect-ratio:1;margin-top:13px;border:1px solid #6b7482;border-radius:5px;overflow:hidden}
    .sq{display:grid;place-items:center;font-family:"Apple Color Emoji","Segoe UI Symbol",serif;font-size:clamp(19px,6vw,31px);line-height:1}
    .light{background:#e8dfc8;color:#171717}.dark{background:#77936c;color:#171717}.foot{margin:12px 0 0;color:#929eae;font-size:11px}
  `;
  root.append(css);

  const panel = document.createElement("section");
  panel.className = "panel hidden";
  panel.innerHTML = `
    <header><strong>♟ ChessAI · Study Helper</strong><div class="row" style="margin:0"><button class="focus-toggle" id="focus-toggle">Focus</button><button class="close" id="minimize" aria-label="Minimize">—</button></div></header>
    <div class="body">
      <p class="hint">Reads the piece positions from the Chess.com board for study and review.</p>
      <div class="row"><button class="action" id="read">Read Chess.com board</button><span class="status" id="status">Waiting for a chessboard…</span></div>
      <div class="meta"><div><b>Your side:</b> <strong id="your-side">Not detected</strong></div><div><b>Next to move:</b> <strong id="turn">Not detected</strong></div><div><b>Move count:</b> <strong id="move-count">Not detected</strong></div><div><b>Mode:</b> <strong id="mode">Checking…</strong></div></div><div id="side-confirm" class="row hidden"><span class="muted">Which colour are you playing?</span><button class="side-choice" data-side="White">White</button><button class="side-choice" data-side="Black">Black</button></div>
      <label>Move history</label><div class="movehistory" id="history">No move history detected yet.</div>
      <label for="fen">Detected FEN</label>
      <textarea id="fen" spellcheck="false">${START_FEN}</textarea>
      <div class="row"><button class="action" id="show">Show FEN</button><button class="action" id="analyze">Analyze now</button></div>
      <div class="recommend" id="recommend"><strong>Best move</strong><div class="best">Waiting for a position</div><div class="detail">Choose your colour and read the board.</div><button class="expand-focus" id="expand-focus" aria-label="Expand panel">↗</button></div>
      <div class="board" id="board" aria-label="Chess position"></div>
      <p class="foot">Works on Chess.com pages where the board and turn can be read. Confirm your colour if asked. Automatic analysis only starts when it can identify your turn. Suggestions use a lightweight local search, not Stockfish.</p>
    </div>`;
  root.append(panel);

  const launcher = document.createElement("button");
  launcher.className = "launcher";
  launcher.textContent = "♟ ChessAI Study";
  launcher.type = "button";
  root.append(launcher);

  const $ = selector => root.querySelector(selector);
  const pieces = { k:"♚",q:"♛",r:"♜",b:"♝",n:"♞",p:"♟",K:"♔",Q:"♕",R:"♖",B:"♗",N:"♘",P:"♙" };

  function renderFen(fen) {
    const fields = fen.trim().split(/\s+/);
    const ranks = fields[0].split("/");
    if (ranks.length !== 8) throw new Error("FEN must contain 8 ranks.");
    const squares = [];
    for (const rank of ranks) {
      const row = [];
      for (const char of rank) {
        if (/^[1-8]$/.test(char)) row.push(...Array(Number(char)).fill(""));
        else if (pieces[char]) row.push(char);
        else throw new Error("FEN contains an invalid piece symbol.");
      }
      if (row.length !== 8) throw new Error("Each FEN rank must describe exactly 8 squares.");
      squares.push(...row);
    }
    const board = $("#board");
    board.replaceChildren();
    squares.forEach((piece,index) => {
      const rank = Math.floor(index/8), file = index%8;
      const square = document.createElement("div");
      square.className = "sq " + ((rank+file)%2===0 ? "light" : "dark");
      square.textContent = pieces[piece] || "";
      board.append(square);
    });
  }

  function readGameMetadata(roots, boardHosts) {
    let fullFen = "";
    for (const el of boardHosts) {
      const values = [el.getAttribute("fen"), el.getAttribute("data-fen"), el.getAttribute("data-position"), el.fen, el.position];
      for (const value of values) {
        if (typeof value === "string" && value.trim().split(/\s+/).length >= 4) {
          fullFen = value.trim();
          break;
        }
      }
      if (fullFen) break;
    }
    let moveText = "";
    let plyCount = null;
    const selectors = ["wc-simple-move-list", "wc-move-list", ".move-list", ".move-list-wrapper", "[data-cy='move-list']"];
    for (const r of roots) {
      for (const selector of selectors) {
        try {
          const el = r.querySelector(selector);
          if (el && el.innerText && el.innerText.trim().length > moveText.length) moveText = el.innerText.trim();
        } catch {}
      }
      try {
        const nodes = r.querySelectorAll("[data-ply], .move-text-component, .node");
        if (nodes.length) {
          const usable = Array.from(nodes).filter(n => (n.innerText || n.textContent || "").trim());
          if (usable.length) plyCount = usable.length;
        }
      } catch {}
    }
    if (plyCount === null && moveText) {
      const san = moveText.match(/(?:^|\s)(?:O-O-O|O-O|[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?[+#]?|\.{3})(?=\s|$)/g);
      if (san) plyCount = san.length;
    }
    let turn = "";
    if (fullFen) {
      const fields = fullFen.split(/\s+/);
      if (fields[1] === "w" || fields[1] === "b") turn = fields[1];
    }
    if (!turn && plyCount !== null) turn = plyCount % 2 === 0 ? "w" : "b";
    return { fullFen, moveText, plyCount, turn };
  }

  function readChessComBoard() {
    // Search the page and any open shadow roots; some Chess.com layouts use web components.
    const roots = [document];
    for (let i = 0; i < roots.length; i++) {
      let nodes = [];
      try { nodes = roots[i].querySelectorAll("*"); } catch {}
      for (const node of nodes) if (node.shadowRoot) roots.push(node.shadowRoot);
    }
    const candidates = [];
    const boardHosts = [];
    for (const r of roots) {
      try {
        candidates.push(...r.querySelectorAll(".piece"));
        boardHosts.push(...r.querySelectorAll("wc-chess-board, chess-board"));
      } catch {}
    }
    const found = new Map();
    for (const el of new Set(candidates)) {
      const classes = typeof el.className === "string" ? el.className : el.getAttribute("class") || "";
      const tokens = el.classList ? Array.from(el.classList) : classes.trim().split(/\s+/);
      const pieceMatch = tokens.find(t => /^[wb][kqrbnp]$/i.test(t));
      const squareMatch = tokens.find(t => /^square-[1-8][1-8]$/i.test(t));
      if (!pieceMatch || !squareMatch) continue;
      const color = pieceMatch[0].toLowerCase();
      const type = pieceMatch[1].toLowerCase();
      const file = Number(squareMatch[7]);
      const rank = Number(squareMatch[8]);
      found.set(file + "," + rank, color === "w" ? type.toUpperCase() : type);
    }
    if (found.size < 2 || ![...found.values()].includes("K") || ![...found.values()].includes("k")) {
      const examples = candidates.slice(0, 5).map(el => String(el.className || el.getAttribute("class") || "")).join(" | ");
      throw new Error("Board not detected. Found " + candidates.length + " piece elements. Classes: " + (examples || "none"));
    }
    const rows = [];
    for (let rank = 8; rank >= 1; rank--) {
      let row = "", empty = 0;
      for (let file = 1; file <= 8; file++) {
        const p = found.get(file + "," + rank);
        if (!p) empty++;
        else { if (empty) row += empty; row += p; empty = 0; }
      }
      if (empty) row += empty;
      rows.push(row);
    }
    // Ignore hidden board elements left behind when Chess.com switches games.
    // The flipped marker may be attached to the board host or one of its wrappers.
    const visibleBoards = boardHosts.filter(el => {
      try {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && el.getClientRects().length > 0;
      } catch { return false; }
    });
    const activeBoards = visibleBoards.length ? visibleBoards : [];
    const orientations = activeBoards.map(el => {
      let node = el;
      let depth = 0;
      while (node && depth < 6) {
        if (node.classList && node.classList.contains("flipped")) return "Black";
        node = node.parentElement;
        depth++;
      }
      // On a visible Chess.com board, absence of the flipped marker means White.
      return "Unknown";
    });
    const uniqueOrientations = [...new Set(orientations)];
    const side = uniqueOrientations.length === 1 ? uniqueOrientations[0] : "Unknown";
    const meta = readGameMetadata(roots, boardHosts);
    const placement = rows.join("/");
    const fen = meta.fullFen || (placement + " " + (meta.turn || "w") + " - - 0 1");
    return { fen, side, count: found.size, turn: meta.turn, plyCount: meta.plyCount, moveText: meta.moveText, fullFen: !!meta.fullFen };
  }

  let analysisPending = false;
  let analysisRun = 0;
  let confirmedSide = "";
  let sideManuallyConfirmed = false;
  let activeGameKey = "";
  let lastSeenPlacement = "";
  let lastAutoFen = "";
  let autoScheduled = false;

  function supportedChessPage() {
    return location.hostname === "www.chess.com" || location.hostname === "chess.com";
  }

  function currentGameKey() { return (location.pathname || "") + (location.search || ""); }

  function setRecommendation(title, detail, best = "") {
    $("#recommend").innerHTML = "<strong></strong><div class='best'></div><div class='detail'></div><button class='expand-focus' id='expand-focus' aria-label='Expand panel'>↗</button>";
    $("#recommend strong").textContent = title;
    $("#recommend .best").textContent = best;
    $("#recommend .detail").textContent = detail;
  }

  function pieceAt(fen, square) {
    const [placement] = fen.split(/\s+/);
    const file = square.charCodeAt(0) - 97;
    const rank = Number(square[1]);
    const rows = placement.split("/");
    let row = rows[8-rank], index = 0;
    for (const ch of row) {
      if (/^[1-8]$/.test(ch)) {
        const n = Number(ch);
        if (file >= index && file < index+n) return "";
        index += n;
      } else {
        if (index === file) return ch;
        index++;
      }
    }
    return "";
  }

  function pieceLabel(symbol) {
    const names = {k:"King",q:"Queen",r:"Rook",b:"Bishop",n:"Knight",p:"Pawn"};
    return names[(symbol || "").toLowerCase()] || "Piece";
  }

  async function runAnalysis() {
    if (!supportedChessPage()) {
      setRecommendation("Chess.com page required", "Open a Chess.com page and read the board first.");
      return;
    }
    const fen = $("#fen").value.trim();
    const fields = fen.split(/\s+/);
    if (fields.length !== 6 || !/^[wb]$/.test(fields[1])) {
      setRecommendation("Complete FEN required", "Enter a valid six-field FEN, including side to move, castling rights and en-passant square.");
      return;
    }
    if (!confirmedSide) {
      setRecommendation("Choose your colour", "Select White or Black first.");
      $("#side-confirm").classList.remove("hidden");
      return;
    }
    const yourTurn = confirmedSide === "White" ? "w" : "b";
    if (fields[1] !== yourTurn) {
      const turnName = fields[1] === "w" ? "White" : "Black";
      setRecommendation("Waiting for your turn", turnName + " to move. ChessAI will suggest a move when " + confirmedSide + " is to move.", "Waiting for " + confirmedSide + " to move");
      return;
    }
    if (!globalThis.ChessAIEngine || typeof globalThis.ChessAIEngine.analyzeFen !== "function") {
      setRecommendation("Analysis engine missing", "The worker-free engine bundle was not loaded. Reinstall the newest ChessAI build.");
      return;
    }
    const runId = ++analysisRun;
    analysisPending = true;
    $("#analyze").disabled = true;
    $("#status").textContent = "Preparing local JavaScript analysis…";
    setRecommendation("Analyzing study position…", "This runs directly in the page without Web Workers. The page may pause briefly while it searches.");
    try {
      const result = await globalThis.ChessAIEngine.analyzeFen(fen, progress => {
        if (runId !== analysisRun) return;
        $("#status").textContent = "Searching · depth " + progress.depth + " · " + progress.nodes.toLocaleString() + " nodes";
      });
      if (runId !== analysisRun) return;
      const symbol = pieceAt(fen, result.from);
      const promo = result.promotion ? " · promotes to " + pieceLabel(result.promotion) : "";
      const score = (result.score / 100).toFixed(2);
      const signedScore = result.score > 0 ? "+" + score : score;
      setRecommendation("Suggested study move", "Move: " + result.san + promo + " · Evaluation: " + signedScore + " (from your side to move). This is a lightweight depth-limited search, not full Stockfish.", pieceLabel(symbol) + " " + result.from + " → " + result.to);
      $("#status").textContent = "Finished · " + result.nodes.toLocaleString() + " nodes";
      lastAutoFen = fen;
    } catch (error) {
      if (runId === analysisRun) setRecommendation("Could not analyze position", error && error.message ? error.message : String(error));
    } finally {
      if (runId === analysisRun) {
        analysisPending = false;
        $("#analyze").disabled = false;
      }
    }
  }

  function syncBoard() {
    try {
      const gameKey = currentGameKey();
      if (gameKey !== activeGameKey) { activeGameKey = gameKey; confirmedSide = ""; sideManuallyConfirmed = false; lastAutoFen = ""; }
      const result = readChessComBoard();
      const placementNow = result.fen.split(/\s+/)[0];
      const startingPlacement = START_FEN.split(" ")[0];
      if (lastSeenPlacement && lastSeenPlacement !== placementNow && placementNow === startingPlacement) { confirmedSide = ""; sideManuallyConfirmed = false; lastAutoFen = ""; }
      lastSeenPlacement = placementNow;
      $("#fen").value = result.fen;
      renderFen(result.fen);
      $("#status").textContent = "Detected " + result.count + " pieces.";
      if (result.fullFen) $("#fen").value = result.fen;
      const detectedSide = result.side === "Unknown" ? "" : result.side;
      if (detectedSide && !sideManuallyConfirmed) confirmedSide = detectedSide;
      $("#your-side").textContent = confirmedSide || "Needs confirmation";
      $("#side-confirm").classList.toggle("hidden", !!confirmedSide);
      const allowed = supportedChessPage();
      $("#mode").textContent = allowed ? "Chess.com page" : "Unsupported page";
      $("#analyze").disabled = !allowed;
      $("#turn").textContent = result.turn ? (result.turn === "w" ? "White" : "Black") : "Unknown — Chess.com did not expose turn data";
      $("#move-count").textContent = result.plyCount === null ? "Unknown" : String(result.plyCount) + " half-moves";
      $("#history").textContent = result.moveText || "Move list not found in the page. Turn may be unavailable.";
      if (allowed && confirmedSide && result.turn && (result.turn === (confirmedSide === "White" ? "w" : "b")) && result.fen !== lastAutoFen && !analysisPending && !autoScheduled) {
        autoScheduled = true;
        setTimeout(() => { autoScheduled = false; if (supportedChessPage()) runAnalysis(); }, 180);
      }
    } catch (error) {
      $("#status").textContent = error.message;
    }
  }

  $("#read").addEventListener("click", syncBoard);
  $("#analyze").addEventListener("click", runAnalysis);
  $("#show").addEventListener("click", () => {
    try { renderFen($("#fen").value); $("#status").textContent = "FEN displayed."; }
    catch (error) { $("#status").textContent = error.message; }
  });
  $("#minimize").addEventListener("click", () => panel.classList.add("hidden"));
  $("#focus-toggle").addEventListener("click", () => panel.classList.toggle("focus"));
  root.addEventListener("click", event => { if (event.target && event.target.closest && event.target.closest("#expand-focus")) panel.classList.remove("focus"); });
  root.querySelectorAll("[data-side]").forEach(button => button.addEventListener("click", () => {
    confirmedSide = button.getAttribute("data-side");
    sideManuallyConfirmed = true;
    $("#your-side").textContent = confirmedSide + " (confirmed)";
    $("#side-confirm").classList.add("hidden");
    lastAutoFen = "";
    syncBoard();
  }));
  launcher.addEventListener("click", () => { panel.classList.toggle("hidden"); if (!panel.classList.contains("hidden")) syncBoard(); });
  renderFen(START_FEN);

  let refreshQueued = false;
  const observer = new MutationObserver(() => {
    if (refreshQueued) return;
    refreshQueued = true;
    setTimeout(() => { refreshQueued = false; syncBoard(); }, 250);
  });
  observer.observe(document.documentElement, {subtree:true,childList:true,attributes:true,attributeFilter:["class"]});
})();