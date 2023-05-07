# ScreenShare
[![Build and release](https://github.com/lassesuomela/ScreenShare/actions/workflows/publish.yml/badge.svg)](https://github.com/lassesuomela/ScreenShare/actions/workflows/publish.yml)
[![Node.js CI](https://github.com/lassesuomela/ScreenShare/actions/workflows/node.js.yml/badge.svg)](https://github.com/lassesuomela/ScreenShare/actions/workflows/node.js.yml)

For one-way screen sharing. Made with Electron and vanilla JS.

# How to setup

 - `npm i` to install dependencies
 - `npm start` to start dev version
 - `npm run make` to build the app
   - Built version will be in `out/screenshare-<os>-<arch>` directory
# Compatibility
Tested with Ubuntu 20 and Windows 10.

# How to use

Watch
  1. Start client
  2. Click "Watch" button
  3. Copy ID

Host
  1. Start client
  2. Paste the ID to the ID field
  3. Select source
  4. Click on "Start" button


# Screenshots

Main page when app is opened

![Index.html](screenshots/index.png)

Host page

![Host](screenshots/host.png)

Watch page

![Watch](screenshots/watch.png)

Hosting

![Hosting](screenshots/sharing.png)

Watching

![Watching](screenshots/watching.png)
