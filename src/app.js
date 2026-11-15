const { fromRows, textToRows, rowsToText, generateGroups, demoData } = GroupGenerator;
const $ = (id) => document.getElementById(id);

let rows = [];
let pairs = [];
let view = "grid";

const el = (tag, props = {}, ...kids) => {
  const e = Object.assign(document.createElement(tag), props);
  e.append(...kids);
  return e;
};

// Rows <-> whichever view is active.
function readRows() {
  if (view === "list") rows = textToRows($("names").value);
  return rows;
}

function renderGrid() {
  const tbody = $("rows");
  tbody.replaceChildren();
  rows.forEach((r, i) => {
    const tr = el("tr");
    for (const [key, cls, label] of [["last", "", "Last name"], ["first", "", "First name"], ["gender", "g", "Gender"]]) {
      const input = el("input", { value: r[key] || "", ariaLabel: label });
      input.dataset.row = i;
      input.dataset.key = key;
      tr.append(el("td", { className: cls }, input));
    }
    const del = el("button", { className: "icon", title: "Remove row", textContent: "✕" });
    del.onclick = () => { rows.splice(i, 1); renderGrid(); refresh(); };
    tr.append(el("td", { className: "x" }, del));
    tbody.append(tr);
  });
}

$("rows").addEventListener("input", (e) => {
  const { row, key } = e.target.dataset;
  if (row !== undefined) rows[row][key] = e.target.value;
  refresh();
});

// Excel pastes tab/newline separated cells: spread them across columns and rows.
$("rows").addEventListener("paste", (e) => {
  const text = e.clipboardData.getData("text");
  if (!/[\t\n]/.test(text)) return;
  e.preventDefault();
  const keys = ["last", "first", "gender"];
  const start = Number(e.target.dataset.row);
  const col = keys.indexOf(e.target.dataset.key);
  text.replace(/\r?\n$/, "").split(/\r?\n/).forEach((line, i) => {
    const cells = line.split("\t");
    while (rows.length <= start + i) rows.push({ last: "", first: "", gender: "" });
    cells.forEach((c, j) => { if (col + j < keys.length) rows[start + i][keys[col + j]] = c.trim(); });
  });
  renderGrid();
  refresh();
});

function addBlankRow() {
  rows.push({ last: "", first: "", gender: "" });
  renderGrid();
}
$("addRow").onclick = () => {
  addBlankRow();
  $("rows").querySelector("tr:last-child input").focus();
};

function setView(next) {
  readRows();
  view = next;
  $("listView").hidden = next !== "list";
  $("gridView").hidden = next !== "grid";
  $("viewList").setAttribute("aria-pressed", next === "list");
  $("viewGrid").setAttribute("aria-pressed", next === "grid");
  if (next === "list") $("names").value = rowsToText(rows);
  else { if (!rows.length) rows.push({ last: "", first: "", gender: "" }); renderGrid(); }
  storage.session.save({ ...storage.session.load(), view });
}
$("viewList").onclick = () => setView("list");
$("viewGrid").onclick = () => setView("grid");
$("names").addEventListener("input", () => { readRows(); refresh(); });

const fullNames = () => rows.filter((r) => (r.last || "").trim() || (r.first || "").trim())
  .map((r) => [r.first, r.last].map((s) => (s || "").trim()).filter(Boolean).join(" "));

function renderPairs() {
  const names = [...new Set(fullNames())].sort((a, b) => a.localeCompare(b));
  for (const id of ["pairA", "pairB"]) {
    const sel = $(id);
    const prev = sel.value;
    sel.replaceChildren(...names.map((n) => el("option", { value: n, textContent: n })));
    if (names.includes(prev)) sel.value = prev;
  }
  $("pairB").selectedIndex = Math.min(1, names.length - 1);
  $("pairs").replaceChildren(...pairs.map((p, i) => {
    const x = el("button", { className: "icon", title: "Remove", textContent: "✕" });
    x.onclick = () => { pairs.splice(i, 1); renderPairs(); persist(); };
    return el("span", { className: "chip" }, `${p[0]} ≠ ${p[1]}`, x);
  }));
}

$("addPair").onclick = () => {
  const a = $("pairA").value, b = $("pairB").value;
  if (!a || !b || a === b) return showError("Pick two different people.");
  showError("");
  if (!pairs.some((p) => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a))) pairs.push([a, b]);
  renderPairs();
  persist();
};

const snapshot = () => ({ rows: readRows().map((r) => ({ ...r })), pairs, count: parseInt($("count").value, 10), mix: $("mix").checked });

function apply(data) {
  rows = (data.rows || []).map((r) => ({ last: r.last || "", first: r.first || "", gender: r.gender || "" }));
  pairs = (data.pairs || []).map((p) => [...p]);
  $("count").value = data.count || 2;
  $("mix").checked = !!data.mix;
  if (view === "list") $("names").value = rowsToText(rows); else renderGrid();
  refresh();
}

function persist() { storage.session.save({ ...snapshot(), view }); }

function refresh() {
  let n = 0;
  try { n = fromRows(rows).length; } catch { n = fullNames().length; }
  $("count-people").textContent = n ? `(${n})` : "";
  renderPairs();
  persist();
}

function showError(msg) { $("error").textContent = msg; }

function renderGroups(groups) {
  $("groups").replaceChildren(...groups.map((g, i) => el("div", { className: "card" },
    el("h2", { textContent: `Group ${i + 1} · ${g.length}` }),
    el("ul", {}, ...g.map((p) => el("li", {}, el("span", { className: `dot ${p.gender}`, title: p.gender || "unspecified" }), p.name))))));
}

function generate() {
  showError("");
  $("groups").replaceChildren();
  try {
    const s = snapshot();
    renderGroups(generateGroups(fromRows(s.rows), s.count, s.pairs, s.mix));
  } catch (e) {
    showError(e.message);
  }
}
$("go").onclick = generate;
for (const id of ["count", "mix"]) $(id).addEventListener("input", persist);

$("demo").onclick = () => {
  apply(demoData());
  $("className").value = "Demo class";
  generate();
};

// Saved classes
function renderSaved(select) {
  const names = storage.classes.names();
  $("saved").replaceChildren(...names.map((n) => el("option", { value: n, textContent: n })));
  if (select && names.includes(select)) $("saved").value = select;
}
const status = (msg) => { $("status").textContent = msg; };

$("save").onclick = () => {
  const name = $("className").value.trim();
  if (!name) return status("Enter a class name to save.");
  const existed = storage.classes.save(name, snapshot());
  renderSaved(name);
  status(existed ? `Updated "${name}".` : `Saved "${name}".`);
};
$("load").onclick = () => {
  const name = $("saved").value;
  const data = storage.classes.get(name);
  if (!data) return status("Nothing to load yet.");
  apply(data);
  $("className").value = name;
  showError("");
  status(`Loaded "${name}". Edit it, then generate groups.`);
};
$("delete").onclick = () => {
  const name = $("saved").value;
  if (!storage.classes.remove(name)) return;
  renderSaved();
  status(`Deleted "${name}".`);
};

// Group count stepper
function stepCount(delta) {
  const max = Math.max(1, fromRowsSafe().length);
  $("count").value = Math.min(max, Math.max(1, (parseInt($("count").value, 10) || 1) + delta));
  persist();
}
function fromRowsSafe() {
  try { return fromRows(rows); } catch { return fullNames(); }
}
$("countDown").onclick = () => stepCount(-1);
$("countUp").onclick = () => stepCount(1);

// Theme
function renderTheme() {
  const dark = document.documentElement.dataset.theme === "dark";
  $("theme").textContent = dark ? "☀️" : "🌙";
  $("theme").setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
}
$("theme").onclick = () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  storage.theme.save(next);
  renderTheme();
};
renderTheme();

// Restore the last session.
const last = storage.session.load();
renderSaved();
apply(last);
if (last.view === "list") setView("list");
else if (!rows.length) addBlankRow();
