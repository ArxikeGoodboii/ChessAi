(() => {
  // Study/review overlay only: manifest deliberately limits this to Chess.com analysis pages.
  if (window.__chessAiOrionLoaded) return;
  window.__chessAiOrionLoaded = true;
  const panelId = "chessai-orion-panel";
  const pieceMap = {wp:"P",wn:"N",wb:"B",wr:"R",wq:"Q",wk:"K",bp:"p",bn:"n",bb:"b",br:"r",bq:"q",bk:"k",wP:"P",wN:"N",wB:"B",wR:"R",wQ:"Q",wK:"K",bP:"p",bN:"n",bB:"b",bR:"r",bQ:"q",bK:"k"};
  let scheduled=false, lastFen="";
  function placement(board) {
    const squares=Array.from({length:8},()=>Array(8).fill(""));
    const pieces=board.querySelectorAll(".piece, [class*='square-'][class*='piece']");
    let found=0;
    for(const el of pieces){
      const cs=Array.from(el.classList), code=cs.map(c=>pieceMap[c]).find(Boolean);
      const sc=cs.find(c=>/^square-[1-8][1-8]$/.test(c));
      if(!code||!sc)continue;
      const m=sc.match(/^square-([1-8])([1-8])$/);
      squares[8-Number(m[2])][Number(m[1])-1]=code; found++;
    }
    if(found<2)return "";
    return squares.map(row=>{let out="",empty=0;for(const p of row){if(!p)empty++;else{if(empty)out+=empty;out+=p;empty=0;}}if(empty)out+=empty;return out;}).join("/");
  }
  function getFen(board){
    const direct=board.getAttribute("fen")||board.getAttribute("data-fen")||board.getAttribute("position");
    if(direct&&direct.trim().split(/\s+/).length===6)return direct.trim();
    const p=placement(board); if(!p)return "";
    // Chess.com may not expose turn/castling metadata in its piece DOM.
    // Defaulting to White is marked as an estimate in the panel.
    return p+" w - - 0 1";
  }
  function create(){
    if(document.getElementById(panelId))return;
    const panel=document.createElement("aside");panel.id=panelId;
    panel.innerHTML='<div class="chessai-head"><strong>♞ ChessAi · Game review</strong><button type="button" aria-label="Minimize">−</button></div><p class="chessai-status">Looking for an analysis board…</p><iframe title="ChessAi Stockfish analysis" src="https://arxikegoodboii.github.io/ChessAi/" loading="lazy"></iframe><small>For reviewing positions on Chess.com Analysis</small>';
    document.documentElement.appendChild(panel);
    panel.querySelector("button").addEventListener("click",()=>{panel.classList.toggle("chessai-min");panel.querySelector("button").textContent=panel.classList.contains("chessai-min")?"+":"−";});
  }
  function update(){
    scheduled=false;if(!document.documentElement)return;create();
    const panel=document.getElementById(panelId),board=document.querySelector("wc-chess-board, chess-board, .board");
    const fen=board?getFen(board):"";
    const status=panel.querySelector(".chessai-status"),frame=panel.querySelector("iframe");
    if(!fen){status.textContent="No readable board found. Open a position in Chess.com Analysis.";return;}
    status.textContent=fen.endsWith(" w - - 0 1")?"Board detected · turn/castling may need correcting":"Board detected · sending position to Stockfish";
    if(fen!==lastFen){lastFen=fen;frame.src="https://arxikegoodboii.github.io/ChessAi/?fen="+encodeURIComponent(fen);}
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(update);}
  const style=document.createElement("style");
  style.textContent="#"+panelId+"{position:fixed;z-index:2147483647;right:10px;bottom:12px;width:min(360px,calc(100vw - 20px));height:min(520px,75vh);box-sizing:border-box;padding:10px;background:#101820;color:#f4f7f8;border:1px solid #2c7774;border-radius:12px;box-shadow:0 8px 30px #0008;font:13px -apple-system,BlinkMacSystemFont,sans-serif;display:flex;flex-direction:column;gap:7px}#"+panelId+" .chessai-head{display:flex;align-items:center;justify-content:space-between}#"+panelId+" strong{color:#69dfd0;font-size:14px}#"+panelId+" button{border:0;border-radius:6px;background:#29434a;color:white;font-size:18px;min-width:30px;min-height:28px}#"+panelId+" p{margin:2px 0}#"+panelId+" iframe{border:0;border-radius:8px;background:#0c141b;width:100%;flex:1;min-height:0}#"+panelId+" small{color:#9aabb2;font-size:10px}#"+panelId+".chessai-min{height:auto;width:auto;padding:8px}#"+panelId+".chessai-min p,#"+panelId+".chessai-min iframe,#"+panelId+".chessai-min small{display:none}";
  (document.head||document.documentElement).appendChild(style);
  new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:["class","fen","data-fen"]});
  schedule();
})();