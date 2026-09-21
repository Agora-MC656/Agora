import "dotenv/config";

import { readFileSync } from "node:fs";
import { createServer } from "node:https";
import { resolve } from "node:path";

import { app } from "./app.js";

const port = Number(process.env.PORT ?? 3000);
const keyPath = process.env.HTTPS_KEY_PATH;
const certPath = process.env.HTTPS_CERT_PATH;

if (!keyPath || !certPath) {
  throw new Error(
    "HTTPS_KEY_PATH and HTTPS_CERT_PATH must be defined in the environment.",
  );
}

const server = createServer(
  {
    key: readFileSync(resolve(keyPath)),
    cert: readFileSync(resolve(certPath)),
  },
  app,
);

server.listen(port, () => {
  console.log(`Backend running at https://localhost:${port}`);
});
