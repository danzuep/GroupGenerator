# Group Generator

A dependency-free page that splits a list of unique names into groups.

- Enter names, one per line, with an optional gender (`Ann, F`).
- Choose the number of groups.
- List pairs that can't share a group (`Ann, Bob`).
- Optionally mix genders evenly.

Open `src/index.html` in a browser (keep `groups.js` beside it). Run tests with `node --test` in `src/`.
CI uploads `index.html` and `groups.js` as the `group-generator` artifact; `pages.yml` publishes `src/` to GitHub Pages.

Settings (names, pairs, group count, gender mix) are saved in the browser's localStorage.
