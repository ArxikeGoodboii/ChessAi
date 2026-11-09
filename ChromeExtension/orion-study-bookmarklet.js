// ChessAi Orion study helper
// This helper is for post-game analysis and study positions only.
(() => {
  if (window.__chessAiStudyBookmarklet) { alert('ChessAi is already open.'); return; }
  window.__chessAiStudyBookmarklet = true;
  const note = document.createElement('div');
  note.style.cssText = 'position:fixed;z-index:2147483647;bottom:12px;left:12px;right:12px;background:#15232c;color:#fff;border:1px solid #58cbbb;border-radius:12px;padding:14px;font:14px -apple-system,sans-serif';
  note.innerHTML = '<b>♞ ChessAi Study</b><p style="margin:8px 0">For analysis, open the ChessAi analysis page in another tab and paste the position FEN.</p><button style="padding:9px 14px;border:0;border-radius:8px;background:#58cbbb" id="chessai-close">Close</button>';
  document.documentElement.appendChild(note);
  note.querySelector('#chessai-close').onclick = () => { note.remove(); window.__chessAiStudyBookmarklet = false; };
})();