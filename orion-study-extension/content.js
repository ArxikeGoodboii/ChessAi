(() => {
  if (window.__chessAIStudyHelperLoaded) return;
  window.__chessAIStudyHelperLoaded = true;

  const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const host = document.createElement("div");
  host.id = "chessai-study-helper-host";
  document.documentElement.appendChild(host);
  const root = host.attachShadow({ mode: "open" });

  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
  // The extension does not depend on this optional stylesheet.
  const css = document.createElement("style");
  css.textContent = `
    :host { all: initial; }
    * { box-sizing: border-box; }
    .launcher { position: fixed; right: 16px; bottom: 22px; z-index: 2147483647; border: 0; border-radius: 999px; padding: 12px 17px; color: white; background: #242b38; font: 700 14px system-ui; box-shadow: 0 5px 22px #0005; cursor: pointer; }
    .panel { position: fixed; right: 16px; bottom: 76px; z-index: 2147483647; width: min(340px, calc(100vw - 24px)); max-height: min(76vh, 680px); overflow: auto; border: 1px solid #394252; border-radius: 16px; background: #171c25; color: #f3f5f8; box-shadow: 0 12px 40px #0008; font: 14px/1.45 system-ui, sans-serif; }
    .hidden { display:none; }
    header { display:flex; justify-content:space-between; align-items:center; padding:13px 15px; background:#222a36; border-radius:16px 16px 0 0; }
    header strong { font-size:15px; }
    .close { border:0; color:#dce2ec; background:transparent; font-size:22px; cursor:pointer; }
    .body { padding:14px; }
    .hint { margin:0 0 10px; color:#b7c0ce; font-size:12px; }
    label { display:block; margin:9px 0 5px; color:#dce2ec; font-size:12px; font-weight:700; }
    textarea { display:block; width:100%; min-height:76px; resize:vertical; border:1px solid #465164; border-radius:9px; padding:9px; background:#0f131a; color:#f3f5f8; font:12px/1.4 ui-monospace,monospace; }
    button.action { border:0; border-radius:9px; padding:9px 12px; background:#7c9cff; color:#101522; font-weight:700; cursor:pointer; }
    .row { display:flex; gap:8px; align-items:center; margin-top:9px; }
    .status { min-height:18px; color:#aeb9c9; font-size:12px; }
    .board { display:grid; grid-template-columns:repeat(8,1fr); width:100%; aspect-ratio:1; margin-top:13px; border:1px solid #6b7482; border-radius:5px; overflow:hidden; }
    .sq { display:grid; place-items:center; font-family:"Apple Color Emoji","Segoe UI Symbol",serif; font-size:clamp(19px, 6vw, 31px); line-height:1; }
    .light { background:#e8dfc8; color:#171717; }
    .dark { background:#77936c; color:#171717; }
    .foot { margin:12px 0 0; color:#929eae; font-size:11px; }
  `;
  root.append(css);

  const panel = document.createElement("section");
  panel.className = "panel hidden";
  panel.innerHTML = `
    <header><strong>♟ ChessAI · Study Helper</strong><button class="close" aria-label="Close">×</button></header>
    <div class="body">
      <p class="hint">Review and practice tool. Paste a FEN position to view it on the board.</p>
      <label for="fen">FEN position</label>
      <textarea id="fen" spellcheck="false">${START_FEN}</textarea>
      <div class="row"><button class="action" id="show">Show position</button><span class="status" id="status">Starting position loaded.</span></div>
      <div class="board" id="board" aria-label="Chess position"></div>
      <p class="foot">This build displays positions only. Engine analysis and automatic Chess.com board reading are not included yet.</p>
    </div>`;
  root.append(panel);

  const launcher = document.createElement("button");
  launcher.className = "launcher";
  launcher.textContent = "♟ ChessAI Study";
  launcher.type = "button";
  root.append(launcher);

  const $ = (selector) => root.querySelector(selector);
  const pieces = { k:"♚", q:"♛", r:"♜", b:"♝", n:"♞", p:"♟", K:"♔", Q:"♕", R:"♖", B:"♗", N:"♘", P:"♙" };

  function renderFen(fen) {
    const fields = fen.trim().split(/\s+/);
    const ranks = fields[0].split("/");
    if (ranks.length !== 8) throw new Error("FEN must contain 8 ranks.");
    const squares = [];
    for (const rank of ranks) {
      let row = [];
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
    squares.forEach((piece, index) => {
      const rank = Math.floor(index / 8);
      const file = index % 8;
      const square = document.createElement("div");
      square.className = "sq " + ((rank + file) % 2 === 0 ? "light" : "dark");
      square.textContent = pieces[piece] || "";
      board.append(square);
    });
    $("#status").textContent = fields[1] === "b" ? "Black to move." : "White to move.";
  }

  $("#show").addEventListener("click", () => {
    try { renderFen($("#fen").value); }
    catch (error) { $("#status").textContent = error.message; }
  });
  $(".close").addEventListener("click", () => panel.classList.add("hidden"));
  launcher.addEventListener("click", () => panel.classList.toggle("hidden"));
  renderFen(START_FEN);
})();