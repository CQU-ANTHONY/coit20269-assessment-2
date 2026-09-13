"use strict";

const fs = require("fs");
const https = require("https");

const createApp = require("./app");
const env = require("./config/env");

const app = createApp();

function start() {
  if (env.httpsKeyPath && env.httpsCertPath) {
    const options = {
      key: fs.readFileSync(env.httpsKeyPath),
      cert: fs.readFileSync(env.httpsCertPath),
    };
    https.createServer(options, app).listen(env.port, () => {
      console.log(`StudySwap API listening on HTTPS port ${env.port}`);
    });
  } else {
    // Render terminates TLS at the edge; plain HTTP behind their proxy.
    app.listen(env.port, () => {
      console.log(`StudySwap API listening on HTTP port ${env.port} (TLS terminated upstream)`);
    });
  }
}

// MONGODB_URI / JWT_SECRET are validated on load via config/env.js.
// DB connection lands in the Atlas task (#9) — the API still boots without it.
start();
