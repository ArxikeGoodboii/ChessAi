self.onmessage = function (event) {
  if (event.data === "ping") self.postMessage("chessai-worker-probe-ok");
};
