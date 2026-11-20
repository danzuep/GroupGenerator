const test = require("node:test");
const assert = require("node:assert");
const { parseNames, rowsToText, textToRows, generateGroups, demoData, fromRows } = require("../src/groups.js");

const people = parseNames(
  "Lee, Ann, F\nRay, Bob, M\nKim, Cam, F\nWu, Dan, M\nSun, Eve, F\nPak, Fay, F\nOng, Gus, M\nHan, Hal, M"
);
const pairs = [["Ann Lee", "Bob Ray"], ["Cam Kim", "Dan Wu"], ["Eve Sun", "Fay Pak"]];

test("parses Last, First, Gender and tab-separated Excel rows", () => {
  const [p] = parseNames("Lee\tAnn\tFemale");
  assert.deepStrictEqual([p.name, p.gender], ["Ann Lee", "f"]);
});

test("rows round-trip through text", () => {
  const text = "Lee, Ann, f\nRay, Bob";
  assert.strictEqual(rowsToText(textToRows(text)), text);
});

test("full-name entry preserves names and optional tab-separated gender", () => {
  const text = "Ann Lee\tF\nBob Ray";
  const rows = textToRows(text, true);
  assert.deepStrictEqual(rows, [{ name: "Ann Lee", gender: "F" }, { name: "Bob Ray", gender: "" }]);
  assert.strictEqual(rowsToText(rows, true), text);
  assert.deepStrictEqual(fromRows(rows).map((p) => [p.name, p.gender]), [["Ann Lee", "f"], ["Bob Ray", ""]]);
});

test("rejects duplicate names", () => {
  assert.throws(() => parseNames("Lee, Ann\nlee, ann"), /Duplicate/);
});

test("rejects unknown names in pairs", () => {
  assert.throws(() => generateGroups(people, 2, [["Ann Lee", "Zed"]], false), /Unknown/);
});

test("conflicting pairs are never grouped together", () => {
  for (let i = 0; i < 100; i++) {
    for (const g of generateGroups(people, 2, pairs, false)) {
      const names = g.map((p) => p.name);
      for (const [a, b] of pairs) assert.ok(!(names.includes(a) && names.includes(b)));
    }
  }
});

test("groups are even in size and genders are mixed", () => {
  for (let i = 0; i < 100; i++) {
    const groups = generateGroups(people, 2, [], true);
    assert.deepStrictEqual(groups.map((g) => g.length), [4, 4]);
    for (const g of groups) assert.strictEqual(g.filter((p) => p.gender === "m").length, 2);
  }
});

test("uneven sizes differ by at most one", () => {
  const sizes = generateGroups(people, 3, [], false).map((g) => g.length).sort();
  assert.deepStrictEqual(sizes, [2, 3, 3]);
});

test("impossible constraints throw", () => {
  const two = fromRows([{ first: "A" }, { first: "B" }]);
  assert.throws(() => generateGroups(two, 1, [["A", "B"]], false), /No valid/);
});

test("demo data is deterministic, unique and groupable", () => {
  const a = demoData(1);
  assert.deepStrictEqual(a, demoData(1));
  const ppl = fromRows(a.rows);
  assert.strictEqual(ppl.length, 24);
  assert.strictEqual(generateGroups(ppl, a.count, a.pairs, a.mix).length, 4);
});
