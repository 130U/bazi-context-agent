import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = resolve(fileURLToPath(new URL("../site/", import.meta.url)));
const host = "127.0.0.1";
const requestedPort = Number(process.argv[2] ?? 4173);
const port = Number.isInteger(requestedPort) && requestedPort >= 0 && requestedPort <= 65_535 ? requestedPort : 4173;
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function resolveRequestPath(requestUrl) {
  const parsed = new URL(requestUrl ?? "/", `http://${host}`);
  const pathname = decodeURIComponent(parsed.pathname);
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const path = resolve(siteRoot, relative);
  if (path !== siteRoot && !path.startsWith(`${siteRoot}${sep}`)) return null;
  return path;
}

export function createPublicPreviewServer() {
  return createServer((request, response) => {
    response.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-src 'none'; frame-ancestors 'none'; worker-src 'none'");
    response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Cache-Control", "no-store");
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end("Method not allowed");
      return;
    }
    let path;
    try {
      path = resolveRequestPath(request.url);
    } catch {
      path = null;
    }
    if (!path || !statSync(path, { throwIfNoEntry: false })?.isFile()) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }
    const type = mimeTypes[extname(path)] ?? "application/octet-stream";
    response.writeHead(200, { "Content-Type": type });
    if (request.method === "HEAD") response.end();
    else createReadStream(path).pipe(response);
  });
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
