import { createServer } from "node:http";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { servePublicSite } from "../src/publicSite.ts";

const host = "127.0.0.1";
const requestedPort = Number(process.argv[2] ?? 4173);
const port = Number.isInteger(requestedPort) && requestedPort >= 0 && requestedPort <= 65_535 ? requestedPort : 4173;
export function createPublicPreviewServer() {
  return createServer((request, response) => servePublicSite(request, response));
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const server = createPublicPreviewServer();
  server.listen(port, host, () => {
    const address = server.address();
    const actualPort = typeof address === "object" && address ? address.port : port;
    process.stdout.write(`Public preview: http://${host}:${actualPort}\n`);
  });
}
