(() => {
  const $ = id => document.getElementById(id);
  let worker = null, ready = false, busy = false, latestFen = "", queuedFen = "";
  const embedded = new URLSearchParams(location.search).get("embedded") === "1";

  function tellParent(type, message, move) {
    if (!embedded) return;
    parent.postMessage({type, message, move}, "*");
  }
  function status(message) {
    $("status").textContent = message;
    tellParent("chessai-engine-status", message);
  }
  function syncFieldsFromFen(fen) {
    const parts = fen.trim().split(/\s+/);
    if (parts.length !== 6) return;
    $("turn").value = parts[1] === "b" ? "b" : "w";
    $("castle").value = parts[2] === "-" ? "" : parts[2];
  }
  function buildFen() {
    const parts = $("fen").value.trim().split(/\s+/);
    if (parts.length === 1) {
      parts.push($("turn").value, $("castle").value || "-", "-", "0", "1");
    } else {
      if (parts.length !== 6) return "";
      parts[1] = $("turn").value;
      parts[2] = $("castle").value || "-";
    }
    return parts.join(" ");
  }
  function applyIncoming(data) {
    let fen = data.fen || "";
    if (!fen && data.placement) fen = data.placement + " w - - 0 1";
    if (!fen) return;
    $("fen").value = fen;
    syncFieldsFromFen(fen);
    $("position-note").textContent = data.estimated
      ? "Piece positions detected. Confirm side to move and castling rights before analysis."
      : "Complete FEN detected from the Chess.com board.";
    $("position-note").className = data.estimated ? "warning" : "";
    queuedFen = fen;
    if (ready) run(buildFen());
    else startEngine();
  }

  window.addEventListener("message", event => {
    if (event.source !== parent || !event.data || event.data.type !== "chessai-set-position") return;
    applyIncoming(event.data);
  });

  function startEngine() {
    if (worker) return;
    try {
      worker = new Worker("./stockfish-19-lite-single.js");
      worker.onmessage = event => {
        const line = String(event.data || "");
        if (line === "uciok") { worker.postMessage("isready"); return; }
        if (line === "readyok") {
          ready = true;
          status("Stockfish ready.");
          $("analyse").disabled = false;
          if (queuedFen) {
            const next = queuedFen;
            queuedFen = "";
            run(next);
          }
          return;
        }
        if (line.startsWith("info ")) {
          const score = line.match(/\bscore (cp|mate) (-?\d+)/);
          const depth = line.match(/\bdepth (\d+)/);
          if (score) {
            const value = score[1] === "mate"
              ? "Mate in " + score[2]
              : (Number(score[2]) / 100).toFixed(2) + " evaluation";
            $("detail").textContent = value + (depth ? " · depth " + depth[1] : "");
          }
        }
        if (line.startsWith("bestmove ")) {
          const move = line.split(/\s+/)[1];
          const fen = latestFen;
          $("move").textContent = move && move !== "(none)"
            ? move.slice(0,2) + " → " + move.slice(2,4) +
              (move.length > 4 ? " · promote to " + move[4].toUpperCase() : "")
            : "No legal move found";
          status("Analysis complete.");
          if (move && move !== "(none)") tellParent("chessai-bestmove", "", move);
          busy = false;
          $("analyse").disabled = false;
          if (queuedFen) {
            const next = queuedFen;
            queuedFen = "";
            run(next);
          }
        }
      };
      worker.onerror = () => {
        status("Stockfish failed to load. Check your connection and reload.");
        $("analyse").disabled = false;
        busy = false;
      };
      $("analyse").disabled = true;
      status("Loading Stockfish…");
      worker.postMessage("uci");
    } catch (error) {
      status("Could not start Stockfish: " + error.message);
    }
  }

  function run(fen) {
    if (!worker || !ready) return;
    if (busy) { queuedFen = fen; worker.postMessage("stop"); return; }
    if (fen.split(/\s+/).length !== 6) {
      status("Enter a valid six-part FEN position.");
      return;
    }
    latestFen = fen;
    busy = true;
    $("analyse").disabled = true;
    $("move").textContent = "Calculating…";
    $("detail").textContent = "";
    status("Analysing position…");
    worker.postMessage("stop");
    worker.postMessage("position fen " + fen);
    worker.postMessage("go depth 15");
  }

  $("turn").addEventListener("change", () => {
    const parts = $("fen").value.trim().split(/\s+/);
    if (parts.length === 6) { parts[1] = $("turn").value; $("fen").value = parts.join(" "); }
  });
  $("castle").addEventListener("change", () => {
    const parts = $("fen").value.trim().split(/\s+/);
    if (parts.length === 6) { parts[2] = $("castle").value || "-"; $("fen").value = parts.join(" "); }
  });
  $("analyse").addEventListener("click", () => {
    const fen = buildFen();
    if (!fen || fen.split(/\s+/).length !== 6) {
      status("Please enter a valid six-part FEN.");
      return;
    }
    if (!worker) { queuedFen = fen; startEngine(); }
    else if (ready) run(fen);
  });

  const initialFen = new URLSearchParams(location.search).get("fen");
  if (initialFen) applyIncoming({fen:initialFen, estimated:false});
})();