const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  packagerConfig: {},
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {},
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "lassesuomela",
          name: "ScreenShare",
        },
        prerelease: false,
        draft: true,
        authToken: process.env.GITHUB_TOKEN,
      },
    },
  ],
};
