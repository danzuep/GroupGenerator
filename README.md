# Group Generator

A dependency-free page that splits a list of unique names into groups.

- Enter names as `Last, First, Gender` (gender optional) in List view, or switch to Grid view and paste columns straight from Excel.
- Choose the number of groups, pick pairs to keep apart, and optionally mix genders evenly.
- **Save** a class by name and **Load** it again next term; settings are stored in the browser's localStorage.
- A light/dark **theme toggle** (defaults to your system setting, remembered per browser).
- **Demo** fills in pseudo-random sample data and generates groups in one click.

Code layout in `src/`: `groups.js` (grouping logic, no DOM), `storage.js` (persistence behind an injectable backend), `app.js` (UI), `style.css`.

Open `src/index.html` in a browser (keep `groups.js` beside it). Run tests with `node --test`.

Pages is built with Hugo (`hugo.yaml`, `.github/workflows/hugo.yml`), which publishes `src/` as-is.
`release.yml` runs the tests on pull requests and uploads `index.html` and `groups.js` as the `group-generator` artifact.
