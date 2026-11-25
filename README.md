# The Atlas of Unfinished Places

One estuary, surveyed four times in ninety years. The four charts do not agree.

This is an interactive chart of a fictional place, Sheet 19: Morrowmouth and the Levels. It exists in four survey editions (1871, 1908, 1934, 1962), each drawn honestly by its own rule and each contradicting the others about ten places: a city nobody moved into, an island that is on two charts and missing from a third, a station with no railway, a district that will not stay pointing the same way.

You compare the editions through a reading glass, read the papers each survey relied on, and settle each contradiction. Your findings are drawn in blue pencil as a fifth edition, which is then filed with the other four and disagrees with all of them.

## Run it

Requires Node 22.12 or newer; the test runner will not start on Node 20. Built and tested on Node 24.11.

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5173.

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on port 5173 |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run preview` | Serve the built site locally |
| `npm test` | Unit tests (Vitest) |
| `npm run typecheck` | TypeScript, no output |
| `npm run lint` | ESLint |

The built site is static and uses relative asset paths and hash routing, so `dist/` can be served from any folder on any static host. There is no backend, no account, no analytics and no network request after the page loads.

### A note on the folder name

The scripts in `package.json` call each tool's Node entry file directly (`node node_modules/vite/bin/vite.js`) instead of the usual `vite`. This is deliberate. On Windows, npm's `.cmd` shims fail when any parent folder has `&` in its name, as `Projects&Experiments` does, because `cmd.exe` reads `&` as a command separator. For the same reason `npx vite` will not work from this folder; use the npm scripts.

## How to use it

- **Sheet.** The lower margin has two rows. *Sheet* chooses the edition on the table; *Glass* chooses the edition seen through the circle. With a mouse the glass follows the pointer. On a touch screen it stays put and you slide the sheet under it.
- **Places.** Click or tap any of the ten places to open its papers: how each edition draws it, three or four records, and a question. A place an edition does not show cannot be clicked on that edition; it is listed at the lower left instead.
- **Findings.** Each answer rests on some records and sets others aside. Choose one and it is drawn on Edition V. The origin of the survey, Null Cairn, can only be settled after the other nine.
- **Gazetteer.** Every place against every edition, searchable by name, person or kind of paper.
- **Keys.** Arrow keys move the sheet, `+` and `-` change the scale, `0` shows the whole sheet, `1` to `5` change edition, `Tab` steps through the places, `Escape` closes a place's papers.

Every view has an address. `#/place/orrow?ed=iii&glass=i` opens Orrow on the 1934 edition with 1871 in the glass.

## How it is built

React 19, TypeScript and Vite. The chart is SVG, so every place is a real link that can be focused, read aloud and opened in a new tab.

```
src/
  carto/        Seeded noise, the height field, contours, and small geometry helpers
  data/         The world: editions, the ten places and their records, roads and rivers
  state/        Hash router and the reader's findings (localStorage)
  components/
    sheet/      The chart: viewport, edition plates, place symbols, the glass
    Dossier     A place's papers and the finding
    Gazetteer   The index
    Yours       Edition V and the Survey Office's reply
    About       How to read the sheet
  styles/       Plain CSS: base (margins), chart, papers, pages
```

**The ground is generated, not drawn.** `carto/terrain.ts` defines one height field for the estuary: a coast, a funnel-shaped trough for the tidal reach, a few hills. Each edition adds its own small seeded error, and `d3-contour` turns the result into a coastline, contours and water lining. That is why the editions quarrel about the shore, and why the sheet is identical on every visit. Orrow is a single term in that function which an edition can switch on or off.

**Each edition is a plate.** `EditionLayer` renders one edition from the same data with its own inks and lettering. The glass is a second plate drawn over the first and clipped to a circle. Plates are memoised, and the glass is moved by writing to the clip path directly, so panning and moving the glass do not re-render the chart.

**The content is data.** `data/places.ts` holds every place, how each edition draws it, its records and its findings. `data/content.test.ts` checks that file for integrity: every citation resolves, every cross-reference points at a real place, every place stands on dry land in every edition, and no complete set of findings agrees entirely with any survey.

**Dependencies** are few on purpose: `react`, `react-dom`, `d3-contour`, and three self-hosted open-source typefaces via Fontsource (Brygada 1918, Archivo, Courier Prime). Routing, state, noise and pan/zoom are written here because each is under 150 lines and a library would have been larger.

## What was checked

- `npm test`: 40 tests pass (content integrity, terrain, geometry, viewport clamping, router, storage).
- `npm run typecheck`, `npm run lint` and `npm run build` pass with no warnings.
- An independent read-only audit of accessibility and correctness raised 20 findings, none blocking. Each was checked against the code and fixed. Most fixes were re-tested in the browser; the multi-touch fix, the reduced-motion citation mark and the gazetteer's focus return were not.
- In a browser at 1440×900 and 375×812: all five editions render; drag, wheel zoom and keyboard pan change the view; clicking a place opens its papers and moves focus to the heading; `Escape` closes them and returns focus; choosing a finding persists across reload; the complete state shows the Survey Office's reply; no console errors.

## Limits

- **Pinch zoom is untested on a real touch device.** The handler exists and single-finger panning was exercised through emulation only.
- **Tested in one Chromium-based browser.** Firefox and Safari were not checked. The CSS uses `color-mix()` and the font width axis, both of which need a browser from 2023 or later.
- **Screen readers were not tested with real assistive technology.** Names, roles and focus order were checked by reading the accessibility tree, not by listening to it. The gazetteer is the intended non-visual route through the content.
- **Your edition lives in one browser.** It is not synced and cannot be exported. Clearing site data removes it.
- **The glass does not follow keyboard focus.** Keyboard users compare editions by switching the sheet with `1` to `5`, or by panning the sheet under the glass.

## What is real

None of the places, people or papers. The conventions are: hydrographers mark features "PD" (position doubtful) and "ED" (existence doubtful), charts were corrected by hand in magenta or violet ink with provisional corrections in pencil, and Sandy Island stayed on charts for about a century after the single voyage that reported it.
