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

peer.on("open", (id) => {});

peer.on("disconnected", () => {
  console.log("Peer dc");
  stop();
});

const call = (remotePeerId) => {
  callConnection = peer.call(remotePeerId, stream);
};

const connect = (remotePeerId) => {
  const conn = peer.connect(remotePeerId);

  conn.on("open", () => {
    console.log("connected");
    console.log(conn);

    conn.on("data", (data) => {
      console.log("Received", data);
    });

    conn.send("test");
  });
};

startBtn.onclick = (e) => {
  if (!stream || !peerId.value) {
    return;
  }
  startBtn.classList.add("btn-danger");
  startBtn.innerText = "Streaming";
  startBtn.setAttribute("disabled", "true");

  console.log("Calling to:", peerId.value);
  call(peerId.value);
  connect(peerId.value);
};

stopBtn.onclick = (e) => {
  if (!stream) {
    return;
  }

  stop();
  callConnection.close();
};

const stop = () => {
  startBtn.classList.remove("btn-danger");
  startBtn.innerText = "Start";
  startBtn.removeAttribute("disabled");

  currentSourceText.innerText = "-";
};

const showSources = () => {
  if (!videoOptionsMenu) {
    return;
  }
  videoOptionsMenu.popup();
};

videoSelectBtn.onclick = showSources;

const getSources = async () => {
  let sources;
  try {
    sources = await ipcRenderer.invoke("getSources");
  } catch (error) {
    console.log(error);
  }

  videoOptionsMenu = Menu.buildFromTemplate(
    sources.map((source) => {
      return {
        label: source.name,
        click: () => selectSource(source),
      };
    })
  );
};

const selectSource = async (source) => {
  currentSourceText.innerText = source.name;

  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: source.id,
        frameRate: 60,
      },
      exact: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: source.id,
      },
    },
  };

  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    if (startBtn.innerText === "Start") {
      startBtn.removeAttribute("disabled");
    }
    stopBtn.removeAttribute("disabled");

    if (startBtn.innerText === "Streaming") {
      call(peerId.value);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to get user media");
  }
};

getSources();
