const { Peer } = require("peerjs");

let callConnection;
let myId;
let connection;

const videoFeed = document.getElementById("master");
const stopBtn = document.getElementById("stopBtn");
const copyIdBtn = document.getElementById("copyIdBtn");
const toggleFullscreenBtn = document.getElementById("toggleFullscreenBtn");
const backBtn = document.getElementById("backBtn");

const statusTxt = document.getElementById("statusTxt");

const peer = new Peer();

peer.on("open", (id) => {
  statusTxt.innerText = "Not connected";
  myId = id;
});

peer.on("connection", (conn) => {
  connection = conn;
  connection.on("open", () => {
    connection.on("data", (data) => {
      console.log("Received", data);
      if (statusTxt.innerText !== "Connected") {
        statusTxt.innerText = "Connected";
      }

      if (data === "Stop") {
        stop();
      }
    });

    connection.send("Connection success");
  });
});

peer.on("call", (call) => {
  if (statusTxt.innerText !== "Connecting") {
    statusTxt.innerText = "Connecting";
  }
  callConnection = call;

  call.answer();
  call.on("stream", (remoteStream) => {
    videoFeed.srcObject = remoteStream;
    videoFeed.play();

    toggleFullscreenBtn.removeAttribute("disabled");
    stopBtn.removeAttribute("disabled");
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
  connection.send("Stop");
  stop();
};

backBtn.onclick = () => {
  if (connection) {
    connection.send("Stop");
  }
  stop();
};

copyIdBtn.onclick = (e) => {
  navigator.clipboard.writeText(myId);
};

const stop = () => {
  toggleFullscreenBtn.setAttribute("disabled", true);
  stopBtn.setAttribute("disabled", true);
  videoFeed.srcObject = null;
  statusTxt.innerText = "Not connected";
  setTimeout(() => {
    connection.close();
    callConnection.close();
  }, 1000);
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
