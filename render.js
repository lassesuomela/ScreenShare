const { ipcRenderer } = require("electron");
const remote = require("@electron/remote");
const { Menu } = remote;
const Peer = require("simple-peer");

let videoOptionsMenu;
let stream;

const videoElement = document.querySelector("video");
const videoElementSlave = document.getElementById("slave");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const videoSelectBtn = document.getElementById("videoSelectBtn");
const currentSourceText = document.getElementById("currentSourceText");

let peer1;
let peer2;

startBtn.onclick = (e) => {
  if (videoElement.srcObject === null) {
    return;
  }

  if (!peer1) {
    peer1 = new Peer({ initiator: true, stream: stream });
  }
  if (!peer2) {
    peer2 = new Peer();
  }

  startBtn.classList.add("is-danger");
  startBtn.innerText = "Streaming";
  startBtn.setAttribute("disabled", "true");

  peer1.on("signal", (data) => {
    peer2.signal(data);
  });

  peer2.on("signal", (data) => {
    peer1.signal(data);
  });

  peer2.on("stream", (stream) => {
    // got remote video stream, now let's show it in a video tag
    const video = document.getElementById("slave");

    if ("srcObject" in video) {
      video.srcObject = stream;
    } else {
      video.src = window.URL.createObjectURL(stream); // for older browsers
    }

    video.play();
  });
};

stopBtn.onclick = (e) => {
  if (videoElement.srcObject === null) {
    return;
  }

  startBtn.classList.remove("is-danger");
  startBtn.innerText = "Start";
  startBtn.removeAttribute("disabled");

  videoElement.srcObject = null;
  currentSourceText.innerText = "-";

  peer1.destroy();
  peer2.destroy();
};

videoSelectBtn.onclick = showSources;

function showSources() {
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
    },
  };

  const newStream = await navigator.mediaDevices.getUserMedia(constraints);
  videoElement.srcObject = newStream;
  videoElement.play();

  if (!stream) {
    stream = newStream;
  } else {
    peer1.removeStream(stream);
    peer1.addStream(newStream);
  }
}

getSources();
