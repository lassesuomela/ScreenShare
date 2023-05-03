const { Peer } = require("peerjs");

let callConnection;
let myId;

const videoFeed = document.getElementById("master");
const stopBtn = document.getElementById("stopBtn");
const copyIdBtn = document.getElementById("copyIdBtn");
const toggleFullscreenBtn = document.getElementById("toggleFullscreenBtn");

const peer = new Peer();

peer.on("open", (id) => {
  myId = id;
});

peer.on("call", (call) => {
  console.log("answering call");
  callConnection = call;

  call.answer();
  call.on("stream", (remoteStream) => {
    console.log("got call stream");
    videoFeed.srcObject = remoteStream;
    videoFeed.play();
  });
});

peer.on("disconnected", () => {
  console.log("Peer dc");
  stop();
});

stopBtn.onclick = (e) => {
  if (!callConnection) {
    return;
  }
  callConnection.close();
  stop();
};

copyIdBtn.onclick = (e) => {
  navigator.clipboard.writeText(myId);
};

const stop = () => {
  videoFeed.srcObject = null;
};

toggleFullscreenBtn.onclick = (e) => {
  if (videoFeed.srcObject === null) {
    return;
  }
  if (videoFeed.requestFullscreen) videoFeed.requestFullscreen();
  else if (videoFeed.webkitRequestFullscreen)
    videoFeed.webkitRequestFullscreen();
  else if (videoFeed.msRequestFullScreen) videoFeed.msRequestFullScreen();
};
