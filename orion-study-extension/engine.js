import { Chess } from "chess.js";

const VALUES = { p: 100, n: 320, b: 335, r: 500, q: 900, k: 0 };
const MATE = 100000;
const MAX_NODES = 14000;

function evaluate(chess, rootColor) {
  let score = 0;
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const p = board[r][f];
      if (!p) continue;
      const sign = p.color === rootColor ? 1 : -1;
      const advance = p.color === "w" ? 6-r : r-1;
      const center = 7 - (Math.abs(3.5-r) + Math.abs(3.5-f));
      let positional = center * (p.type === "n" || p.type === "b" ? 5 : 2);
      if (p.type === "p") positional += advance * 5;
      score += sign * (VALUES[p.type] + positional);
    }
  }
  return score;
}

function moveOrder(moves) {
  return moves.sort((a,b) => {
    const av = (a.captured ? VALUES[a.captured] * 10 - VALUES[a.piece] : 0) + (a.promotion ? VALUES[a.promotion] : 0);
    const bv = (b.captured ? VALUES[b.captured] * 10 - VALUES[b.piece] : 0) + (b.promotion ? VALUES[b.promotion] : 0);
    return bv-av;
  });
}

function search(chess, depth, alpha, beta, rootColor, state, ply) {
  state.nodes++;
  if (state.nodes > MAX_NODES) return evaluate(chess, rootColor);
  if (chess.isCheckmate()) return chess.turn() === rootColor ? -MATE + ply : MATE - ply;
  if (chess.isDraw()) return 0;
  if (depth === 0) return evaluate(chess, rootColor);

  const maximizing = chess.turn() === rootColor;
  let best = maximizing ? -Infinity : Infinity;
  const moves = moveOrder(chess.moves({ verbose: true }));
  if (!moves.length) return evaluate(chess, rootColor);

  for (const move of moves) {
    chess.move({ from: move.from, to: move.to, promotion: move.promotion });
    const score = search(chess, depth-1, alpha, beta, rootColor, state, ply+1);
    chess.undo();
    if (maximizing) {
      if (score > best) best = score;
      alpha = Math.max(alpha, best);
    } else {
      if (score < best) best = score;
      beta = Math.min(beta, best);
    }
    if (beta <= alpha || state.nodes > MAX_NODES) break;
  }
  return best;
}

export async function analyzeFen(fen, onProgress = () => {}) {
  const chess = new Chess(fen);
  const rootColor = chess.turn();
  const legal = chess.moves({ verbose: true });
  if (!legal.length) throw new Error(chess.isCheckmate() ? "This position is checkmate." : "No legal moves in this position.");
  let bestMove = null;
  let bestScore = -Infinity;
  let totalNodes = 0;
  for (let depth = 1; depth <= 3; depth++) {
    await new Promise(resolve => setTimeout(resolve, 20));
    const state = { nodes: 0 };
    let depthBest = null;
    let depthScore = -Infinity;
    let alpha = -Infinity;
    const ordered = moveOrder(chess.moves({ verbose: true }));
    for (const move of ordered) {
      chess.move({ from: move.from, to: move.to, promotion: move.promotion });
      const score = search(chess, depth-1, alpha, Infinity, rootColor, state, 1);
      chess.undo();
      if (score > depthScore) {
        depthScore = score;
        depthBest = move;
      }
      alpha = Math.max(alpha, depthScore);
      if (state.nodes > MAX_NODES) break;
    }
    if (depthBest) {
      bestMove = depthBest;
      bestScore = depthScore;
    }
    totalNodes += state.nodes;
    onProgress({ depth, nodes: totalNodes });
    if (state.nodes > MAX_NODES) break;
  }
  if (!bestMove) throw new Error("The search could not find a move.");
  return {
    from: bestMove.from,
    to: bestMove.to,
    promotion: bestMove.promotion || "",
    san: bestMove.san,
    score: bestScore,
    depth: Math.min(3, Math.max(1, Math.floor(totalNodes / Math.max(1, totalNodes)))),
    nodes: totalNodes
  };
}
