const { ipcRenderer } = require("electron");
const remote = require("@electron/remote");
const { Menu } = remote;
const { Peer } = require("peerjs");

let videoOptionsMenu;
let stream;
let callConnection;

const videoFeed = document.getElementById("master");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

const host = document.getElementById("host");

const peerId = document.getElementById("peerId");
const copyIdBtn = document.getElementById("copyIdBtn");

const videoSelectBtn = document.getElementById("videoSelectBtn");
videoSelectBtn.onclick = showSources;

const currentSourceText = document.getElementById("currentSourceText");

const peer = new Peer();

let myId;
peer.on("open", (id) => {
  myId = id;
});

peer.on("call", (call) => {
  console.log("answering call");
  callConnection = call;
  call.answer(stream);
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

copyIdBtn.onclick = (e) => {
  navigator.clipboard.writeText(myId);
};

function stop() {
  startBtn.classList.remove("btn-danger");
  startBtn.innerText = "Start";
  startBtn.removeAttribute("disabled");

  videoFeed.srcObject = null;
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
