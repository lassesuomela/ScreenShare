const { ipcRenderer } = require("electron");
const remote = require("@electron/remote");

const { Menu } = remote;

let videoOptionsMenu;

const videoElement = document.querySelector("video");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const videoSelectBtn = document.getElementById("videoSelectBtn");
const currentSourceText = document.getElementById("currentSourceText");

startBtn.onclick = (e) => {
  if (videoElement.srcObject === null) {
    return;
  }

  startBtn.classList.add("is-danger");
  startBtn.innerText = "Streaming";
  startBtn.setAttribute("disabled", "true");
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

  const stream = await navigator.mediaDevices.getUserMedia(constraints);

  videoElement.srcObject = stream;
  videoElement.play();
}

getSources();
