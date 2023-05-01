const { ipcRenderer } = require("electron");
const remote = require("@electron/remote");
const { Menu } = remote;
const { Peer } = require("peerjs");

let videoOptionsMenu;
let stream;
let callConnection;

const peer = new Peer();

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

const peerId = document.getElementById("peerId");

const currentSourceText = document.getElementById("currentSourceText");
const videoSelectBtn = document.getElementById("videoSelectBtn");
videoSelectBtn.onclick = showSources;

peer.on("open", (id) => {});

peer.on("disconnected", () => {
  console.log("Peer dc");
  stop();
});

function call(remotePeerId) {
  callConnection = peer.call(remotePeerId, stream);

  callConnection.on("stream", (remoteStream) => {
    console.log("got remote stream");
    videoFeed.srcObject = remoteStream;
    videoFeed.play();
  });
}

startBtn.onclick = (e) => {
  startBtn.classList.add("btn-danger");
  startBtn.innerText = "Streaming";
  startBtn.setAttribute("disabled", "true");

  console.log("Calling to:", peerId.value);
  call(peerId.value);
};

stopBtn.onclick = (e) => {
  stop();
  callConnection.close();
};

function stop() {
  startBtn.classList.remove("btn-danger");
  startBtn.innerText = "Start";
  startBtn.removeAttribute("disabled");

  currentSourceText.innerText = "-";
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
