import { ALL_EDITIONS, editionLabel, EDITIONS, STATUS_MEANING } from '../data/editions';
import type { Status } from '../data/types';
import { hrefWith, type Route } from '../state/router';
import { StatusGlyph } from './common';

const STATUSES: Status[] = ['stands', 'proposed', 'struck', 'doubtful', 'ruin', 'absent'];

export function About({ route }: { route: Route }) {
  return (
    <div className="page about">
      <header className="page-head">
        <h1>How to read this sheet</h1>
        <p className="page-lead">
          Sheet 19 covers the mouth of the River Morrow and the low country behind it. It has been surveyed four times in
          ninety years. Each survey was honest by its own rule, and the four do not agree about what is there.
        </p>
      </header>

      <section>
        <h2>The editions</h2>
        <ol className="about-editions">
          {ALL_EDITIONS.map((id) => (
            <li key={id} className={`ed-${id}`}>
              <h3>
                <a href={hrefWith(route, { view: 'sheet', placeId: null, ed: id })}>{editionLabel(id)}</a>
                <span>{EDITIONS[id].title}</span>
              </h3>
              <p className="about-surveyor">{EDITIONS[id].surveyor}.</p>
              <p>{EDITIONS[id].rule}</p>
              <p className="about-caution">{EDITIONS[id].caution}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2>What to do</h2>
        <ol className="about-steps">
          <li>
            <strong>Compare.</strong> Choose an edition for the sheet and another for the glass in the lower margin. The
            glass shows the second through the first. With a mouse it follows the pointer; on a touch screen it stays put
            and you slide the sheet beneath it.
          </li>
          <li>
            <strong>Read.</strong> Open any place to see how each edition drew it and the papers each survey relied on.
            The papers contradict one another. That is why the editions do.
          </li>
          <li>
            <strong>Settle.</strong> Choose a finding. Each one rests on some papers and has to set others aside. Your
            findings are drawn on a fifth edition, in blue pencil. The origin of the survey can only be settled last.
          </li>
        </ol>
      </section>

      <section>
        <h2>The six ways a place is drawn</h2>
        <dl className="about-legend">
          {STATUSES.map((s) => (
            <div key={s}>
              <dt>
                <StatusGlyph status={s} label />
              </dt>
              <dd>{STATUS_MEANING[s]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2>Moving the sheet</h2>
        <dl className="about-keys">
          <div>
            <dt>Drag, or arrow keys</dt>
            <dd>Move the sheet.</dd>
          </div>
          <div>
            <dt>Scroll, pinch, or + and −</dt>
            <dd>Change the scale.</dd>
          </div>
          <div>
            <dt>0</dt>
            <dd>Show the whole sheet.</dd>
          </div>
          <div>
            <dt>1 to 5</dt>
            <dd>Put that edition on the sheet.</dd>
          </div>
          <div>
            <dt>Tab</dt>
            <dd>Step through the places. Enter opens one; Escape closes its papers.</dd>
          </div>
        </dl>
      </section>

      <section>
        <h2>What is real</h2>
        <p>
          None of it. The estuary, the towns, the surveyors and every paper on file were invented for this atlas. The
          coastline is plotted in your browser from a fixed set of numbers, a little differently for each edition, which
          is why it is the same each time you visit and why the editions quarrel about the shore.
        </p>
        <p>
          The conventions are borrowed from real charts. Hydrographers do mark a feature “PD” when its position is
          doubtful and “ED” when its existence is. Chart corrections were made by hand in magenta or violet ink, and
          provisional ones in pencil. Islands have stayed on charts for a century after the one voyage that reported them.
        </p>
      </section>

      <section>
        <h2>Colophon</h2>
        <p>
          Set in Brygada 1918, a Polish text face designed in the year of its name and digitised a century later, with Archivo for the
          margins and Courier Prime for anything that came out of a typewriter. All three are open-source and served from
          this site. Nothing you do here leaves your browser.
        </p>
      </section>
    </div>
  );
}
