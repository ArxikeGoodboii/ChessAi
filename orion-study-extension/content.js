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
    .panel { position:fixed;right:16px;bottom:76px;z-index:2147483647;width:min(340px,calc(100vw - 24px));max-height:min(62vh,560px);overflow:auto;border:1px solid #394252;border-radius:16px;background:#171c25;color:#f3f5f8;box-shadow:0 12px 40px #0008;font:14px/1.45 system-ui,sans-serif; }
    .hidden { display:none; } header { display:flex;justify-content:space-between;align-items:center;padding:13px 15px;background:#222a36;border-radius:16px 16px 0 0; }
    .focus-toggle{border:1px solid #526078;border-radius:8px;padding:6px 9px;background:#273246;color:#fff;font:700 12px system-ui;cursor:pointer}.quick-focus{position:fixed;top:calc(env(safe-area-inset-top,0px) + 10px);right:12px;z-index:2147483647;border:1px solid #526078;border-radius:999px;padding:8px 12px;background:#222a36;color:#fff;font:700 12px system-ui;box-shadow:0 4px 14px #0007;cursor:pointer}.panel.focus{width:min(172px,calc(100vw - 16px));height:68px;max-height:68px;bottom:18px;right:8px;border-radius:11px;overflow:hidden}.panel.focus header{display:none}.panel.focus .body{padding:6px}.panel.focus .body>*:not(#recommend){display:none!important}.panel.focus #recommend{display:block;margin:0;padding:0;border:0;background:transparent}.panel.focus #recommend strong,.panel.focus #recommend .detail{display:none}.panel.focus #recommend .best{display:block;padding:9px 25px 7px 3px;font-size:16px;font-weight:800;line-height:1.25;color:#fff;white-space:normal}.panel.focus .expand-focus{display:block}.expand-focus{display:none;position:absolute;right:5px;top:5px;border:0;border-radius:6px;padding:3px 6px;background:#303b4c;color:#fff;font-size:15px;cursor:pointer}
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
    <header><strong>♟ ChessAI · Study Helper</strong><button class="close" id="minimize" aria-label="Minimize">—</button></header>
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
  const quickFocus = document.createElement("button");
  quickFocus.className = "quick-focus hidden";
  quickFocus.type = "button";
  quickFocus.textContent = "Focus";
  quickFocus.setAttribute("aria-label", "Toggle compact move window");
  root.append(quickFocus);

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
    const prioritizedHosts = boardHosts.slice().sort((a,b) => {
      const area = el => {
        try {
          const rect = el.getBoundingClientRect();
          return rect.width > 80 && rect.height > 80 ? rect.width * rect.height : 0;
        } catch { return 0; }
      };
      return area(b) - area(a);
    });
    for (const el of prioritizedHosts) {
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
    const selectors = ["wc-simple-move-list", "wc-move-list", ".move-list", ".move-list-wrapper", "[data-cy='move-list']"];
    for (const r of roots) {
      for (const selector of selectors) {
        try {
          const el = r.querySelector(selector);
          if (el && el.innerText && el.innerText.trim().length > moveText.length) moveText = el.innerText.trim();
        } catch {}
      }
    }
    // Never infer whose turn it is from DOM node counts: Chess.com can render
    // duplicate/hidden move nodes. Only trust an exact six-field FEN.
    let turn = "";
    if (fullFen) {
      const fields = fullFen.split(/\s+/);
      if (fields.length === 6 && (fields[1] === "w" || fields[1] === "b")) turn = fields[1];
      else fullFen = "";
    }
    return { fullFen, moveText, turn };
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
    // Prefer visible pieces inside the largest visible board to avoid mixing
    // hidden/previous boards and small board previews into the position.
    const visibleCandidates = candidates.filter(el => {
      try { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && el.getClientRects().length > 0; }
      catch { return false; }
    });
    const visibleHosts = boardHosts.filter(el => {
      try { const r = el.getBoundingClientRect(); return r.width > 80 && r.height > 80 && el.getClientRects().length > 0; }
      catch { return false; }
    }).sort((a,b) => {
      const ar=a.getBoundingClientRect(), br=b.getBoundingClientRect();
      return (br.width*br.height)-(ar.width*ar.height);
    });
    let selectedCandidates = visibleCandidates;
    if (visibleHosts.length) {
      const boardRect = visibleHosts[0].getBoundingClientRect();
      const within = visibleCandidates.filter(el => {
        const r=el.getBoundingClientRect(), x=r.left+r.width/2, y=r.top+r.height/2;
        return x>=boardRect.left-2 && x<=boardRect.right+2 && y>=boardRect.top-2 && y<=boardRect.bottom+2;
      });
      if (within.length >= 2) selectedCandidates = within;
    }
    const found = new Map();
    for (const el of new Set(selectedCandidates)) {
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
    const activeBoards = visibleBoards.length ? visibleBoards.slice().sort((a,b) => {
      const ar=a.getBoundingClientRect(), br=b.getBoundingClientRect();
      return (br.width*br.height)-(ar.width*ar.height);
    }).slice(0,1) : [];
    const orientations = activeBoards.map(el => {
      let node = el;
      let depth = 0;
      while (node && depth < 14) {
        if (node.classList && node.classList.contains("flipped")) return "Black";
        const orientation = (node.getAttribute && (node.getAttribute("data-orientation") || node.getAttribute("data-board-orientation") || "")).toLowerCase();
        if (orientation === "black" || orientation === "black-bottom") return "Black";
        if (orientation === "white" || orientation === "white-bottom") return "White";
        if (node.parentElement) node = node.parentElement;
        else {
          const rootNode = node.getRootNode && node.getRootNode();
          node = rootNode && rootNode.host ? rootNode.host : null;
        }
        depth++;
      }
      // No marker is not proof that the user is White.
      return "Unknown";
    });
    const uniqueOrientations = [...new Set(orientations)];
    const side = uniqueOrientations.length === 1 ? uniqueOrientations[0] : "Unknown";
    const meta = readGameMetadata(roots, boardHosts);
    const placement = rows.join("/");
    const fen = meta.fullFen || (placement + " ? - - 0 1");
    return { fen, side, count: found.size, turn: meta.turn, moveText: meta.moveText, fullFen: !!meta.fullFen };
  }

  let analysisPending = false;
  let analysisRun = 0;
  let confirmedSide = "";
  let sideManuallyConfirmed = false;
  let activeGameKey = "";
  let lastSeenPlacement = "";
  let lastObservedFen = "";
  let lastAutoFen = "";
  let lastDisplaySide = "";
  let fenInputDirty = false;
  let autoScheduled = false;

  function supportedChessPage() {
    if (location.hostname !== "www.chess.com" && location.hostname !== "chess.com") return false;
    // Practice/training pages only; do not run on live/online games.
    return /^\/(play\/computer|puzzles|analysis|study)(\/|$)/i.test(location.pathname || "/");
  }

  function currentGameKey() { return (location.pathname || "") + (location.search || ""); }

  function invalidateRunningAnalysis() {
    if (!analysisPending) return;
    analysisRun++;
    analysisPending = false;
    $("#analyze").disabled = !supportedChessPage();
    $("#status").textContent = "Position changed — previous analysis discarded.";
  }

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

  async function runAnalysis(automatic = false) {
    if (!supportedChessPage()) {
      setRecommendation("Chess.com page required", "Open a supported Chess.com practice page and read the board first.");
      return;
    }
    let fen = automatic ? lastObservedFen : $("#fen").value.trim();
    let fields = fen.split(/\s+/);
    let assumedTurn = false;
    if (fields.length !== 6 || !/^[wb]$/.test(fields[1])) {
      // Manual analysis may use the visible piece placement and the user's
      // selected colour as an explicit turn assumption. Never use this for
      // automatic analysis because the real turn is unknown.
      const placement = fields[0] || "";
      if (automatic || !confirmedSide || !/^(?:[prnbqkPRNBQK1-8]+\/){7}[prnbqkPRNBQK1-8]+$/.test(placement)) {
        setRecommendation("Turn data unavailable", "Chess.com has not exposed a complete FEN. Select your colour, then use Analyze now for a manual study estimate.");
        return;
      }
      const assumedColorTurn = confirmedSide === "White" ? "w" : "b";
      fen = placement + " " + assumedColorTurn + " - - 0 1";
      fields = fen.split(/\s+/);
      assumedTurn = true;
      $("#status").textContent = "Manual analysis · assuming " + confirmedSide + " to move; castling/en-passant rights are unknown.";
    }
    if (!confirmedSide) {
      setRecommendation("Choose your colour", "Select White or Black first.");
      $("#side-confirm").classList.remove("hidden");
      return;
    }
    const yourTurn = confirmedSide === "White" ? "w" : "b";
    if (fields[1] !== yourTurn) {
      const turnName = fields[1] === "w" ? "White" : "Black";
      setRecommendation("Waiting for your turn", turnName + " to move. ChessAI will suggest a move when " + confirmedSide + " is to move.", "Waiting for " + turnName + " to move");
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
      const result = await globalThis.ChessAIEngine.analyzeFen(
        fen,
        progress => {
          if (runId !== analysisRun) return;
          $("#status").textContent = "Searching · depth " + progress.depth + " · " + progress.nodes.toLocaleString() + " nodes";
        },
        () => runId !== analysisRun
      );
      if (runId !== analysisRun || result.cancelled) return;

      // Before showing a result, make sure the live board still matches the
      // position that was searched. Manual FEN entry remains supported.
      if (automatic || assumedTurn) {
        try {
          const live = readChessComBoard();
          const livePlacement = live.fen.split(/\s+/)[0];
          const expectedPlacement = fen.split(/\s+/)[0];
          if ((automatic && (!live.fullFen || live.fen !== fen)) ||
              (assumedTurn && livePlacement !== expectedPlacement)) {
            setTimeout(syncBoard, 0);
            return;
          }
        } catch {
          setTimeout(syncBoard, 0);
          return;
        }
      }

      const symbol = pieceAt(fen, result.from);
      const promo = result.promotion ? " · promotes to " + pieceLabel(result.promotion) : "";
      const score = (result.score / 100).toFixed(2);
      const signedScore = result.score > 0 ? "+" + score : score;
      const assumption = assumedTurn ? " Manual estimate: assumes " + confirmedSide + " to move; castling and en-passant rights are unknown." : "";
      setRecommendation("Suggested study move", "Move: " + result.san + promo + " · Evaluation: " + signedScore + " · Search depth: " + result.depth + " · Nodes: " + result.nodes.toLocaleString() + ". This is a local search, not full Stockfish." + assumption, pieceLabel(symbol) + " " + result.from + " → " + result.to);
      $("#status").textContent = "Finished · " + result.nodes.toLocaleString() + " nodes";
      lastAutoFen = fen;
    } catch (error) {
      if (runId === analysisRun) setRecommendation("Could not analyze position", error && error.message ? error.message : String(error));
    } finally {
      if (runId === analysisRun) {
        analysisPending = false;
        $("#analyze").disabled = !supportedChessPage();
        setTimeout(() => { if (supportedChessPage()) syncBoard(); }, 120);
      }
    }
  }

  function syncBoard() {
    try {
      const gameKey = currentGameKey();
      if (gameKey !== activeGameKey) {
        invalidateRunningAnalysis();
        activeGameKey = gameKey;
        confirmedSide = "";
        sideManuallyConfirmed = false;
        lastAutoFen = "";
        lastObservedFen = "";
        lastSeenPlacement = "";
        lastDisplaySide = "";
        fenInputDirty = false;
      }
      const result = readChessComBoard();
      const previousObservedFen = lastObservedFen;
      const firstObservedPosition = !previousObservedFen;
      const positionChanged = !!previousObservedFen && previousObservedFen !== result.fen;
      if (positionChanged) {
        invalidateRunningAnalysis();
        lastAutoFen = "";
      }
      lastObservedFen = result.fen;
      const placementNow = result.fen.split(/\s+/)[0];
      const startingPlacement = START_FEN.split(" ")[0];
      if (lastSeenPlacement && lastSeenPlacement !== placementNow && placementNow === startingPlacement) {
        confirmedSide = "";
        sideManuallyConfirmed = false;
        lastAutoFen = "";
        lastDisplaySide = "";
      }
      lastSeenPlacement = placementNow;
      if (!fenInputDirty) $("#fen").value = result.fen;
      renderFen(result.fen);
      if (!analysisPending && (firstObservedPosition || positionChanged || sideChanged)) {
        $("#status").textContent = "Detected " + result.count + " pieces." + (result.turn ? "" : " Turn unavailable; automatic analysis paused.");
      }
      const detectedSide = result.side === "Unknown" ? "" : result.side;
      if (detectedSide && !sideManuallyConfirmed) confirmedSide = detectedSide;
      const sideChanged = confirmedSide !== lastDisplaySide;
      lastDisplaySide = confirmedSide;
      $("#your-side").textContent = confirmedSide || "Needs confirmation";
      $("#side-confirm").classList.toggle("hidden", !!confirmedSide);
      const allowed = supportedChessPage();

      // Never leave a recommendation from the previous position on screen.
      // Only update this message on a genuinely new/first-read position so it
      // cannot overwrite active search progress or a completed manual result.
      if ((firstObservedPosition || positionChanged || sideChanged) && !analysisPending) {
        if (!confirmedSide) {
          setRecommendation("Choose your colour", "Select White or Black before requesting a move.");
        } else if (!result.turn) {
          setRecommendation("Turn data unavailable", "Automatic analysis is paused. Select your colour and use Analyze now for a manual estimate.");
        } else if (result.turn !== (confirmedSide === "White" ? "w" : "b")) {
          const turnName = result.turn === "w" ? "White" : "Black";
          setRecommendation("Waiting for your turn", turnName + " to move. ChessAI will analyse when " + confirmedSide + " is to move.");
        } else {
          setRecommendation("New position detected", "Preparing a local study analysis…");
        }
      }

      $("#mode").textContent = allowed ? "Practice / study page" : "Practice pages only";
      $("#analyze").disabled = !allowed || analysisPending;
      $("#turn").textContent = result.turn ? (result.turn === "w" ? "White" : "Black") : "Unknown — no reliable FEN turn data";
      $("#move-count").textContent = "Unavailable (not safely exposed)";
      $("#history").textContent = result.moveText || "Move list not found in the page. Turn may be unavailable.";
      if (allowed && confirmedSide && result.turn && (result.turn === (confirmedSide === "White" ? "w" : "b")) && result.fen !== lastAutoFen && !analysisPending && !autoScheduled) {
        autoScheduled = true;
        setTimeout(() => { autoScheduled = false; if (supportedChessPage()) runAnalysis(true); }, 180);
      }
    } catch (error) {
      $("#status").textContent = error.message;
    }
  }

  $("#fen").addEventListener("input", () => { fenInputDirty = true; });
  $("#read").addEventListener("click", () => { fenInputDirty = false; syncBoard(); });
  $("#analyze").addEventListener("click", runAnalysis);
  $("#show").addEventListener("click", () => {
    try { renderFen($("#fen").value); $("#status").textContent = "FEN displayed."; }
    catch (error) { $("#status").textContent = error.message; }
  });
  $("#minimize").addEventListener("click", () => { panel.classList.add("hidden"); quickFocus.classList.add("hidden"); });
  quickFocus.addEventListener("click", () => { panel.classList.toggle("focus"); quickFocus.textContent = panel.classList.contains("focus") ? "Expand" : "Focus"; });
  root.addEventListener("click", event => { if (event.target && event.target.closest && event.target.closest("#expand-focus")) { panel.classList.remove("focus"); quickFocus.textContent = "Focus"; } });
  root.querySelectorAll("[data-side]").forEach(button => button.addEventListener("click", () => {
    confirmedSide = button.getAttribute("data-side");
    sideManuallyConfirmed = true;
    $("#your-side").textContent = confirmedSide + " (confirmed)";
    $("#side-confirm").classList.add("hidden");
    lastAutoFen = "";
    syncBoard();
  }));
  launcher.addEventListener("click", () => { panel.classList.toggle("hidden"); if (!panel.classList.contains("hidden")) { quickFocus.classList.remove("hidden"); syncBoard(); } else quickFocus.classList.add("hidden"); });
  renderFen(START_FEN);

  let refreshQueued = false;
  const observer = new MutationObserver(() => {
    if (refreshQueued) return;
    refreshQueued = true;
    setTimeout(() => { refreshQueued = false; syncBoard(); }, 250);
  });
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["class", "style", "fen", "data-fen", "data-position", "data-orientation", "data-board-orientation"]
  });

  // A low-frequency reconciliation catches board/FEN updates that do not
  // generate observable class or child-list mutations in Chess.com's UI.
  setInterval(() => {
    if (supportedChessPage() && !document.hidden) syncBoard();
  }, 850);
})();