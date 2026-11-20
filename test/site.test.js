const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");

test("branch-based homepage redirects to the app", () => {
  const homepage = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(homepage, /http-equiv="refresh" content="0; url=src\/"/);
  assert.ok(fs.existsSync(path.join(root, "src", "index.html")));
});

test("settings start collapsed and contain the pair and gender controls", () => {
  const app = fs.readFileSync(path.join(root, "src", "index.html"), "utf8");
  const settings = app.match(/<details class="card">([\s\S]*?)<\/details>/);
  assert.ok(settings);
  assert.match(settings[1], /<summary><h2>Settings<\/h2><\/summary>/);
  assert.match(settings[1], /id="pairA"/);
  assert.match(settings[1], /id="pairB"/);
  assert.match(settings[1], /id="mix"/);
  assert.equal((app.match(/id="mix"/g) || []).length, 1);
});
