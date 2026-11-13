import assert from "node:assert/strict";
import { Chess } from "chess.js";
import { analyzeFen } from "./engine.js";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1";

function applyAndValidate(fen, result, expectedColor) {
  const chess = new Chess(fen);
  const move = chess.move({
    from: result.from,
    to: result.to,
    ...(result.promotion ? { promotion: result.promotion } : {})
  });
  assert.ok(move, "engine result must be a legal move");
  assert.equal(move.san, result.san, "SAN must describe the returned move");
  assert.equal(move.color, expectedColor, "move must belong to the side to move");
  assert.ok(result.depth >= 1, "at least one complete search depth must finish");
  assert.ok(result.nodes > 0, "search must visit nodes");
}

const whiteStart = await analyzeFen(START_FEN);
applyAndValidate(START_FEN, whiteStart, "w");

const blackStartFen = START_FEN.replace(" w ", " b ");
const blackStart = await analyzeFen(blackStartFen);
applyAndValidate(blackStartFen, blackStart, "b");

// A hanging queen must be captured rather than allowing it to take the rook.
// This forces the search to evaluate captures on the minimizing reply.
const tacticalFen = "4k3/8/8/8/4q3/8/4R3/4K3 w - - 0 1";
const tactical = await analyzeFen(tacticalFen);
assert.equal(tactical.from, "e2");
assert.equal(tactical.to, "e4");
applyAndValidate(tacticalFen, tactical, "w");

const cancelled = await analyzeFen(START_FEN, () => {}, () => true);
assert.equal(cancelled.cancelled, true, "obsolete searches must stop between depths");

const checkmateFen = "7k/6Q1/6K1/8/8/8/8/8 b - - 0 1";
await assert.rejects(
  () => analyzeFen(checkmateFen),
  /checkmate/i,
  "checkmate positions must be reported instead of suggesting a move"
);

const stalemateFen = "7k/5Q2/6K1/8/8/8/8/8 b - - 0 1";
await assert.rejects(
  () => analyzeFen(stalemateFen),
  /no legal moves/i,
  "stalemate positions must not produce a move"
);

await assert.rejects(
  () => analyzeFen("this is not a FEN"),
  /fen|position|invalid/i,
  "invalid FEN must fail clearly"
);

console.log("ChessAI engine smoke tests passed.");
