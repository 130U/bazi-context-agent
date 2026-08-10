import { existsSync, lstatSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const siteRoot = join(root, "site");

function fail(message) {
  throw new Error(`Public site validation failed: ${message}`);
}

function filesBelow(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  });
}

function source(path) {
  return readFileSync(path, "utf8");
}

function requirePattern(value, pattern, message) {
  if (!pattern.test(value)) fail(message);
}

function forbidPattern(value, pattern, message) {
  if (pattern.test(value)) fail(message);
}

const allSiteFiles = filesBelow(siteRoot);
if (allSiteFiles.some((path) => lstatSync(path).isSymbolicLink())) fail("symbolic links are not allowed in the deploy artifact");

const htmlPath = join(siteRoot, "index.html");
const html = source(htmlPath);
requirePattern(html, /<meta\s+http-equiv="Content-Security-Policy"/i, "index.html is missing a Content Security Policy");
for (const directive of [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'"
]) requirePattern(html, new RegExp(directive.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `CSP is missing ${directive}`);
requirePattern(html, /<meta\s+name="referrer"\s+content="strict-origin-when-cross-origin"/i, "index.html is missing the referrer policy");
forbidPattern(html, /<script(?![^>]*\bsrc=)[^>]*>/i, "inline scripts are not allowed");
forbidPattern(html, /<style(?:\s|>)/i, "inline style blocks are not allowed");
forbidPattern(html, /\sstyle\s*=/i, "inline style attributes are not allowed");
forbidPattern(html, /<[^>]+\son[a-z]+\s*=/i, "inline event handlers are not allowed");
requirePattern(html, /<script\s+type="module"\s+src="\.\/app\.js"><\/script>/i, "the public entry point must be an external module");

const JavaScriptBudget = 120_000;
const jsFiles = allSiteFiles.filter((path) => extname(path) === ".js");
const totalJavaScriptBytes = jsFiles.reduce((sum, path) => sum + statSync(path).size, 0);
if (totalJavaScriptBytes > JavaScriptBudget) fail(`JavaScript budget exceeded (${totalJavaScriptBytes} > ${JavaScriptBudget} bytes)`);

for (const path of jsFiles) {
  const value = source(path);
  forbidPattern(value, /\b(?:innerHTML|outerHTML|insertAdjacentHTML)\b/, `${path} uses an HTML injection sink`);
  forbidPattern(value, /document\.write\s*\(|\beval\s*\(|new\s+Function\s*\(/, `${path} uses dynamic code execution`);
  forbidPattern(value, /https?:\/\//, `${path} contains a remote runtime URL`);
  for (const match of value.matchAll(/(?:from\s+|import\s*)["'](\.[^"']+)["']/g)) {
    const importedPath = resolve(dirname(path), match[1]);
    if (!existsSync(importedPath)) fail(`${path} imports missing module ${match[1]}`);
  }
}

const coreSource = filesBelow(join(siteRoot, "core")).map(source).join("\n");
forbidPattern(coreSource, /\b(?:document|localStorage|sessionStorage|globalThis)\s*\./, "deterministic core accesses browser state");
forbidPattern(coreSource, /\bfetch\s*\(|XMLHttpRequest|WebSocket/, "deterministic core accesses the network");
forbidPattern(coreSource, /openai|anthropic|api[_-]?key/i, "deterministic core references an AI provider or secret");

const privacySource = source(join(siteRoot, "ui", "privacy.js"));
forbidPattern(privacySource, /(?:localStorage|sessionStorage)\.(?:setItem|getItem|clear)\s*\(/, "privacy module may only remove known legacy keys");
requirePattern(privacySource, /localStorage\.removeItem\(key\)/, "privacy module must clear known localStorage keys");
requirePattern(privacySource, /sessionStorage\.removeItem\(key\)/, "privacy module must clear known sessionStorage keys");

const runtimeConfigPath = join(siteRoot, "data", "runtime-config.json");
if (statSync(runtimeConfigPath).size > 100_000) fail("runtime-config.json exceeds the browser input limit");
JSON.parse(source(runtimeConfigPath));

console.log(`Public site validation passed: ${allSiteFiles.length} files, ${jsFiles.length} modules, ${totalJavaScriptBytes} JS bytes.`);
