# Group Generator

A dependency-free page that splits a list of unique names into groups.

- Enter names as `Last, First, Gender` (gender optional) in the Grid (default) or List view, and paste columns straight from Excel. Enable **Enter full names** to use a single full-name field; in List view, optional gender can follow the name after a tab.
- Choose the number of groups, pick pairs to keep apart, and optionally mix genders evenly.
- Expand **Keep apart** only when needed to keep the student display uncluttered.
- **Save** a class by name and **Load** it again next term; settings are stored in the browser's localStorage.
- A light/dark **theme toggle** (defaults to your system setting, remembered per browser).
- **Demo** fills in pseudo-random sample data and generates groups in one click.

Code layout in `src/`: `groups.js` (grouping logic, no DOM), `storage.js` (persistence behind an injectable backend), `app.js` (UI), `style.css`.

Open `src/index.html` in a browser (keep `groups.js` beside it). Run tests with `node --test`.

Pages is built with Hugo (`hugo.yaml`, `.github/workflows/hugo.yml`), which publishes `src/` as-is.
`hugo.yml` runs the tests on pull requests and pushes to `main`, uploads the app as the `group-generator` artifact, and deploys to Pages from `main` only.
