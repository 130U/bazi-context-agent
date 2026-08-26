import { createReadStream, statSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const PUBLIC_SITE_ROOT = resolve(fileURLToPath(new URL("../site/", import.meta.url)));
export const PUBLIC_SITE_CSP = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-src 'none'; frame-ancestors 'none'; worker-src 'none'";

const MIME_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

export function setPublicSecurityHeaders(response: ServerResponse): void {
  response.setHeader("Content-Security-Policy", PUBLIC_SITE_CSP);
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Permissions-Policy", "camera=(), geolocation=(), microphone=()");
  response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  response.setHeader("Cross-Origin-Resource-Policy", "same-origin");
}

export function resolvePublicSitePath(requestUrl: string | undefined, siteRoot = PUBLIC_SITE_ROOT): string | null {
  const parsed = new URL(requestUrl ?? "/", "http://127.0.0.1");
  const pathname = decodeURIComponent(parsed.pathname);
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const path = resolve(siteRoot, relative);
  if (path !== siteRoot && !path.startsWith(`${siteRoot}${sep}`)) return null;
  return path;
}

export function servePublicSite(
  request: IncomingMessage,
  response: ServerResponse,
  siteRoot = PUBLIC_SITE_ROOT
): void {
  setPublicSecurityHeaders(response);
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end("Method not allowed");
    return;
  }

  let path: string | null;
  try {
    path = resolvePublicSitePath(request.url, siteRoot);
  } catch {
    path = null;
  }
  if (!path || !statSync(path, { throwIfNoEntry: false })?.isFile()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, { "Content-Type": MIME_TYPES[extname(path)] ?? "application/octet-stream" });
  if (request.method === "HEAD") response.end();
  else createReadStream(path).pipe(response);
}
