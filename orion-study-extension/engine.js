import { Chess } from "chess.js";

const VALUES = { p: 100, n: 320, b: 335, r: 500, q: 900, k: 0 };
const MATE = 100000;
const MAX_NODES = 45000;
const MAX_DEPTH = 5;
const QUIESCENCE_DEPTH = 5;

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
    const score = m => {
      let value = 0;
      if (m.captured) value += VALUES[m.captured] * 10 - VALUES[m.piece];
      if (m.promotion) value += VALUES[m.promotion] * 10;
      if (m.san && (m.san.includes("+") || m.san.includes("#"))) value += 80;
      return value;
    };
    return score(b) - score(a);
  });
}

function terminalScore(chess, rootColor, ply) {
  if (chess.isCheckmate()) return chess.turn() === rootColor ? -MATE + ply : MATE - ply;
  if (chess.isDraw()) return 0;
  return null;
}

function quiescence(chess, alpha, beta, rootColor, state, ply, qply) {
  state.nodes++;
  if (state.nodes > MAX_NODES) return evaluate(chess, rootColor);
  const terminal = terminalScore(chess, rootColor, ply);
  if (terminal !== null) return terminal;

  const inCheck = chess.isCheck();
  const standPat = evaluate(chess, rootColor);
  if (!inCheck) {
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;
    if (qply >= QUIESCENCE_DEPTH) return standPat;
  } else if (qply >= QUIESCENCE_DEPTH) {
    return standPat;
  }

  let moves = chess.moves({ verbose: true });
  if (!inCheck) moves = moves.filter(m => m.captured || m.promotion);
  moves = moveOrder(moves);
  if (!moves.length) return inCheck ? (chess.turn() === rootColor ? -MATE + ply : MATE - ply) : standPat;

  const maximizing = chess.turn() === rootColor;
  let best = inCheck ? (maximizing ? -Infinity : Infinity) : standPat;
  for (const move of moves) {
    chess.move({ from: move.from, to: move.to, promotion: move.promotion });
    const score = quiescence(chess, alpha, beta, rootColor, state, ply+1, qply+1);
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

function search(chess, depth, alpha, beta, rootColor, state, ply) {
  state.nodes++;
  if (state.nodes > MAX_NODES) return evaluate(chess, rootColor);
  const terminal = terminalScore(chess, rootColor, ply);
  if (terminal !== null) return terminal;
  if (depth === 0) return quiescence(chess, alpha, beta, rootColor, state, ply, 0);

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
  const legal = moveOrder(chess.moves({ verbose: true }));
  if (!legal.length) throw new Error(chess.isCheckmate() ? "This position is checkmate." : "No legal moves in this position.");

  let bestMove = null;
  let bestScore = -Infinity;
  let totalNodes = 0;
  let completedDepth = 0;

  for (let depth = 1; depth <= MAX_DEPTH; depth++) {
    await new Promise(resolve => setTimeout(resolve, 25));
    const state = { nodes: 0 };
    let depthBest = null;
    let depthScore = -Infinity;
    let alpha = -Infinity;
    let complete = true;

    for (const move of legal) {
      chess.move({ from: move.from, to: move.to, promotion: move.promotion });
      const score = search(chess, depth-1, alpha, Infinity, rootColor, state, 1);
      chess.undo();
      if (state.nodes > MAX_NODES) {
        complete = false;
        break;
      }
      if (score > depthScore) {
        depthScore = score;
        depthBest = move;
      }
      alpha = Math.max(alpha, depthScore);
    }

    totalNodes += state.nodes;
    onProgress({ depth, nodes: totalNodes });
    if (!complete || !depthBest) break;
    bestMove = depthBest;
    bestScore = depthScore;
    completedDepth = depth;
  }

  if (!bestMove) throw new Error("The search could not complete a safe first pass.");
  return {
    from: bestMove.from,
    to: bestMove.to,
    promotion: bestMove.promotion || "",
    san: bestMove.san,
    score: bestScore,
    depth: completedDepth,
    nodes: totalNodes
  };
}
