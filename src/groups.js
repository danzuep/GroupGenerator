(function (root) {
  const clean = (s) => (s || "").trim();

  // Rows are { last, first, gender }. Blank rows are skipped; names must be unique.
  function fromRows(rows) {
    const people = [];
    const seen = new Set();
    for (const r of rows) {
      const last = clean(r.last);
      const first = clean(r.first);
      if (!last && !first) continue;
      const name = [first, last].filter(Boolean).join(" ");
      const key = name.toLowerCase();
      if (seen.has(key)) throw new Error(`Duplicate name: ${name}`);
      seen.add(key);
      people.push({ name, last, first, gender: clean(r.gender).slice(0, 1).toLowerCase() });
    }
    return people;
  }

  // "Last, First, Gender" per line; tabs (pasted from Excel) work too. A single field is a lone name.
  function textToRows(text) {
    return text
      .split(/\r?\n/)
      .filter((line) => line.trim())
      .map((line) => {
        const f = line.split(/\t|,/).map(clean);
        return f.length === 1 ? { last: "", first: f[0], gender: "" } : { last: f[0], first: f[1], gender: f[2] || "" };
      });
  }

  const rowsToText = (rows) =>
    rows
      .filter((r) => clean(r.last) || clean(r.first))
      .map((r) => [r.last, r.first, r.gender].map(clean).join(", ").replace(/(, )+$/, ""))
      .join("\n");

  const parseNames = (text) => fromRows(textToRows(text));

  function shuffle(items, rng) {
    const a = items.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Randomised greedy placement, retried until every person fits.
  function attempt(people, groupCount, banned, mixGenders, rng) {
    const maxSize = Math.ceil(people.length / groupCount);
    const groups = Array.from({ length: groupCount }, () => []);
    for (const p of shuffle(people, rng)) {
      const key = p.name.toLowerCase();
      const options = groups
        .filter((g) => g.length < maxSize && !g.some((m) => banned.get(key)?.has(m.name.toLowerCase())))
        .map((g) => ({
          g,
          score: (mixGenders ? g.filter((m) => m.gender === p.gender).length * 1000 : 0) + g.length + rng(),
        }));
      if (!options.length) return null;
      options.sort((x, y) => x.score - y.score)[0].g.push(p);
    }
    return groups;
  }

  // pairs: [["Ann Lee", "Bob Ray"], ...] by full name, case-insensitive.
  function generateGroups(people, groupCount, pairs, mixGenders, rng = Math.random) {
    if (!Number.isInteger(groupCount) || groupCount < 1) throw new Error("Group count must be at least 1.");
    if (groupCount > people.length) throw new Error("More groups than people.");
    const known = new Set(people.map((p) => p.name.toLowerCase()));
    const banned = new Map();
    for (const pair of pairs) {
      const [a, b] = pair.map((n) => n.toLowerCase());
      if (!known.has(a) || !known.has(b)) throw new Error(`Unknown name in pair: ${pair.join(" + ")}`);
      if (a === b) throw new Error(`A person can't be paired with themselves: ${pair[0]}`);
      if (!banned.has(a)) banned.set(a, new Set());
      if (!banned.has(b)) banned.set(b, new Set());
      banned.get(a).add(b);
      banned.get(b).add(a);
    }
    for (let i = 0; i < 500; i++) {
      const groups = attempt(people, groupCount, banned, mixGenders, rng);
      if (groups) return groups;
    }
    throw new Error("No valid grouping found; relax the constraints or use fewer groups.");
  }

  const FIRST = {
    f: ["Ava", "Mia", "Zoe", "Ella", "Ruby", "Isla", "Nora", "Lily", "Chloe", "Priya", "Aiko", "Sofia"],
    m: ["Liam", "Noah", "Ethan", "Leo", "Jack", "Omar", "Kai", "Owen", "Theo", "Arjun", "Hugo", "Mateo"],
    x: ["Sam", "Alex", "Jordan", "Riley"],
  };
  const LAST = ["Smith", "Nguyen", "Patel", "Garcia", "Kim", "Brown", "Khan", "Silva", "Cohen", "Lopez", "Walker", "Tanaka", "Murphy", "Ivanov", "Okafor", "Rossi"];

  function mulberry32(seed) {
    return function () {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Deterministic pseudo-random sample class; the same seed gives the same class.
  function demoData(seed = Date.now(), size = 24) {
    const rng = mulberry32(seed);
    const pick = (a) => a[Math.floor(rng() * a.length)];
    const rows = [];
    const used = new Set();
    while (rows.length < size) {
      const r = rng();
      const gender = r < 0.46 ? "f" : r < 0.92 ? "m" : "x";
      const first = pick(FIRST[gender]);
      const last = pick(LAST);
      if (used.has(first + last)) continue;
      used.add(first + last);
      rows.push({ last, first, gender });
    }
    const full = (r) => `${r.first} ${r.last}`;
    const pairs = [0, 2, 4].map((i) => [full(rows[i]), full(rows[i + 1])]);
    return { rows, pairs, count: 4, mix: true };
  }

  const api = { fromRows, textToRows, rowsToText, parseNames, generateGroups, demoData };
  if (typeof module !== "undefined") module.exports = api;
  else root.GroupGenerator = api;
})(typeof self !== "undefined" ? self : this);
