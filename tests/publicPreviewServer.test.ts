import test from "node:test";
import assert from "node:assert/strict";
import { createPublicPreviewServer } from "../scripts/servePublicSite.ts";

async function withServer(run) {
  const server = createPublicPreviewServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  assert.ok(address && typeof address === "object");
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("public preview serves the deployable ESM application with security headers", async () => {
  await withServer(async (origin) => {
    const page = await fetch(`${origin}/`);
    assert.equal(page.status, 200);
    assert.match(page.headers.get("content-type") ?? "", /text\/html/);
    assert.match(page.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
    assert.equal(page.headers.get("x-content-type-options"), "nosniff");
    assert.match(await page.text(), /<script type="module" src="\.\/app\.js"><\/script>/);

    const module = await fetch(`${origin}/core/rectification.js`);
    assert.equal(module.status, 200);
    assert.match(module.headers.get("content-type") ?? "", /text\/javascript/);
  });
});

test("public preview rejects traversal and non-read methods", async () => {
  await withServer(async (origin) => {
    const traversal = await fetch(`${origin}/%2e%2e/package.json`);
    assert.equal(traversal.status, 404);

    const post = await fetch(`${origin}/`, { method: "POST" });
    assert.equal(post.status, 405);
    assert.equal(post.headers.get("allow"), "GET, HEAD");
  });
});
