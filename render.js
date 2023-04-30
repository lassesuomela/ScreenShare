const { ipcRenderer } = require("electron");
const remote = require("@electron/remote");
const { Menu } = remote;
const { Peer } = require("peerjs");

let videoOptionsMenu;
let stream;

const video = document.getElementById("master");
const videoSlave = document.getElementById("slave");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const connectBtn = document.getElementById("connectBtn");

const host = document.getElementById("host");

const peerId = document.getElementById("peerId");
const myId = document.getElementById("myId");

const videoSelectBtn = document.getElementById("videoSelectBtn");
videoSelectBtn.onclick = showSources;

const currentSourceText = document.getElementById("currentSourceText");

const peer = new Peer();

peer.on("open", (id) => {
  myId.innerText = id;
});

peer.on("call", (call) => {
  console.log("answering call");
  call.answer(stream);
  call.on("stream", (remoteStream) => {
    console.log("got call stream");
    videoSlave.srcObject = remoteStream;
    videoSlave.play();
  });
});

peer.on("disconnected", () => {
  console.log("Peer dc");
  stop();
});

function call(remotePeerId) {
  const call = peer.call(remotePeerId, stream);

  call.on("stream", (remoteStream) => {
    console.log("got remote stream");
    video.srcObject = remoteStream;
    video.play();
  });
}

connectBtn.onclick = () => {
  console.log("Calling to:", peerId.value);
  call(peerId.value);
};

startBtn.onclick = (e) => {
  startBtn.classList.add("is-danger");
  startBtn.innerText = "Streaming";
  startBtn.setAttribute("disabled", "true");
};

stopBtn.onclick = (e) => {
  peer.close();
  stop();
};

function stop() {
  startBtn.classList.remove("is-danger");
  startBtn.innerText = "Start";
  startBtn.removeAttribute("disabled");

  video.srcObject = null;
  currentSourceText.innerText = "-";

  videoSlave.srcObject = null;
}

function showSources() {
  if (!videoOptionsMenu) {
    return;
  }
  videoOptionsMenu.popup();
}

async function getSources() {
  const inputSources = await ipcRenderer.invoke("getSources");

  videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map((source) => {
      return {
        label: source.name,
        click: () => selectSource(source),
      };
    })
  );
}

async function selectSource(source) {
  currentSourceText.innerText = source.name;

  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: source.id,
      },
      exact: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: source.id,
      },
    },
  };

  try {
    const newStream = await navigator.mediaDevices.getUserMedia(constraints);
    if (!stream) {
      stream = newStream;
    }
  } catch (err) {
    console.error(err);
    alert("Failed to get user media");
  }
}

getSources();
