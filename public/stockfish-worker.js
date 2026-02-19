// public/stockfish-worker.js
let stockfish = new Worker("./stockfish.js");

stockfish.addEventListener("message", (e) => {
  postMessage(e.data);
});

onmessage = (e) => {
  stockfish.postMessage(e.data);
};
