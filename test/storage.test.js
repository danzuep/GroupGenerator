const test = require("node:test");
const assert = require("node:assert");
const { createStorage } = require("../src/storage.js");

const memory = () => {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) };
};

test("classes save, overwrite, list sorted, load and remove", () => {
  const s = createStorage(memory());
  assert.strictEqual(s.classes.save("b", { count: 2 }), false);
  assert.strictEqual(s.classes.save("a", { count: 3 }), false);
  assert.strictEqual(s.classes.save("b", { count: 4 }), true);
  assert.deepStrictEqual(s.classes.names(), ["a", "b"]);
  assert.deepStrictEqual(s.classes.get("b"), { count: 4 });
  assert.strictEqual(s.classes.remove("a"), true);
  assert.strictEqual(s.classes.remove("a"), false);
});

test("theme defaults to undefined and persists", () => {
  const s = createStorage(memory());
  assert.strictEqual(s.theme.load(), undefined);
  s.theme.save("dark");
  assert.strictEqual(s.theme.load(), "dark");
});

test("corrupt or unavailable storage falls back safely", () => {
  const bad = { getItem: () => "{oops", setItem: () => { throw new Error("full"); } };
  const s = createStorage(bad);
  assert.deepStrictEqual(s.session.load(), {});
  assert.doesNotThrow(() => s.session.save({ a: 1 }));
});
