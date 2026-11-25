import { ALL_EDITIONS, editionLabel, EDITIONS } from '../data/editions';
import { hrefWith, type Route } from '../state/router';
import { StateLink } from './common';

/**
 * The sheet's lower margin: which edition lies on the table, and which is in the glass.
 * Two rows over the same five columns, like the cursors of a slide rule.
 */
export function EditionRail({ route }: { route: Route }) {
  const edition = EDITIONS[route.ed];
  return (
    <footer className="rail">
      <div className="rail-note">
        <p className="rail-title">
          <strong>{editionLabel(route.ed)}.</strong> {edition.title}
        </p>
        <p className="rail-rule">{edition.rule}</p>
      </div>

      <div className="rail-tracks">
        <nav className="track track-sheet" aria-label="Edition on the sheet">
          <span className="track-name">Sheet</span>
          {ALL_EDITIONS.map((id) => (
            <StateLink
              key={id}
              href={hrefWith(route, { ed: id })}
              className={`pick ed-${id}`}
              aria-current={route.ed === id ? 'true' : undefined}
              aria-label={`Sheet: ${editionLabel(id)}, ${EDITIONS[id].title}`}
            >
              <span className="pick-num">{EDITIONS[id].numeral}</span>
              <span className="pick-year">{EDITIONS[id].year ?? 'yours'}</span>
            </StateLink>
          ))}
          <span className="pick pick-blank" aria-hidden="true" />
        </nav>

        <nav className="track track-glass" aria-label="Edition in the reading glass">
          <span className="track-name">Glass</span>
          {ALL_EDITIONS.map((id) =>
            id === route.ed ? (
              <span key={id} className="pick pick-blank" aria-hidden="true" />
            ) : (
              <StateLink
                key={id}
                href={hrefWith(route, { glass: id })}
                className={`pick ed-${id}`}
                aria-current={route.glass === id ? 'true' : undefined}
                aria-label={`Glass: ${editionLabel(id)}`}
              >
                <span className="pick-lens" />
              </StateLink>
            ),
          )}
          <StateLink
            href={hrefWith(route, { glass: null })}
            className="pick pick-off"
            aria-current={route.glass === null ? 'true' : undefined}
            aria-label="Put the glass away"
          >
            Off
          </StateLink>
        </nav>
      </div>
    </footer>
  );
}
