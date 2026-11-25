import { useMemo, useRef, useState } from 'react';
import { gridRef } from '../carto/geometry';
import { ALL_EDITIONS, EDITIONS, STATUS_LABEL, STATUS_MEANING } from '../data/editions';
import { PLACES } from '../data/places';
import { chosenOption, depictionFor } from '../data/resolve';
import type { Findings, Place, Status } from '../data/types';
import { hrefWith, type Route } from '../state/router';
import { plain, StatusGlyph } from './common';

type Show = 'all' | 'open' | 'settled';

const STATUSES: Status[] = ['stands', 'proposed', 'struck', 'doubtful', 'ruin', 'absent'];

/** Everything a reader might type to find a place: its names on every edition, its kind, its papers. */
function haystack(place: Place): string {
  return [
    place.name,
    place.kindLabel,
    gridRef(place.at),
    place.premise,
    ...Object.values(place.depictions).map((d) => d.name),
    ...place.records.flatMap((r) => [r.kind, plain(r.title), r.author]),
  ]
    .join(' ')
    .toLowerCase();
}

export function Gazetteer({ route, findings }: { route: Route; findings: Findings }) {
  const [query, setQuery] = useState('');
  const [show, setShow] = useState<Show>('all');
  const search = useRef<HTMLInputElement>(null);
  const index = useMemo(() => PLACES.map((p) => ({ place: p, text: haystack(p) })), []);

  const q = query.trim().toLowerCase();
  const rows = index
    .filter(({ text }) => q === '' || q.split(/\s+/).every((word) => text.includes(word)))
    .filter(({ place }) => {
      const settled = !!chosenOption(place, findings);
      return show === 'all' || (show === 'settled') === settled;
    })
    .map(({ place }) => place);

  return (
    <div className="page gazetteer">
      <header className="page-head">
        <h1>Gazetteer</h1>
        <p className="page-lead">
          Ten places on Sheet 19, against every edition that has drawn them. Read along a row: wherever the symbol
          changes, two surveys disagree.
        </p>
      </header>

      <div className="gaz-tools">
        <label className="gaz-search">
          <span>Find a place, a person or a kind of paper</span>
          <input
            ref={search}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Orrow, lighthouse, Varga, ledger"
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <fieldset className="gaz-show">
          <legend>Show</legend>
          {(
            [
              ['all', 'All ten'],
              ['open', 'Not yet settled'],
              ['settled', 'Settled by you'],
            ] as [Show, string][]
          ).map(([value, text]) => (
            <label key={value}>
              <input type="radio" name="show" value={value} checked={show === value} onChange={() => setShow(value)} />
              <span>{text}</span>
            </label>
          ))}
        </fieldset>
      </div>

      <p className="gaz-count" role="status">
        {rows.length === PLACES.length ? 'All ten places.' : `${rows.length} of ${PLACES.length} places.`}
      </p>

      {rows.length === 0 ? (
        <div className="empty">
          {q ? (
            <>
              <p className="empty-lead">No place on any edition answers to “{query.trim()}”.</p>
              <p>That is not proof there is none. Try a name as an older edition lettered it, or a surveyor.</p>
            </>
          ) : show === 'settled' ? (
            <>
              <p className="empty-lead">You have not settled anything yet.</p>
              <p>Open a place, read its papers, and choose a finding. It will be listed here.</p>
            </>
          ) : (
            <>
              <p className="empty-lead">Nothing is left unsettled.</p>
              <p>
                Every place has a finding. <a href={hrefWith(route, { view: 'yours' })}>Read the Survey Office’s reply.</a>
              </p>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              search.current?.focus();
              setQuery('');
              setShow('all');
            }}
          >
            Show all ten places
          </button>
        </div>
      ) : (
        <table className="gaz-table" role="table">
          <thead role="rowgroup">
            <tr role="row">
              <th scope="col" role="columnheader">
                Place
              </th>
              <th scope="col" role="columnheader" className="gaz-square">
                Square
              </th>
              {ALL_EDITIONS.map((id) => (
                <th key={id} scope="col" role="columnheader" className={`gaz-ed ed-${id}`}>
                  <span className="gaz-num">{EDITIONS[id].numeral}</span>
                  <span className="gaz-year">{EDITIONS[id].year ?? 'yours'}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody role="rowgroup">
            {rows.map((place) => (
              <tr key={place.id} role="row">
                <th scope="row" role="rowheader">
                  <a href={hrefWith(route, { view: 'sheet', placeId: place.id })}>{place.name}</a>
                  <span className="gaz-kind">{place.kindLabel}</span>
                </th>
                <td role="cell" className="gaz-square">
                  {gridRef(place.at)}
                </td>
                {ALL_EDITIONS.map((id) => {
                  const dep = depictionFor(place, id, findings);
                  return (
                    <td
                      key={id}
                      role="cell"
                      className={`gaz-ed ed-${id}${dep.settled ? '' : ' is-open'}`}
                      data-edition={EDITIONS[id].numeral}
                    >
                      {dep.settled ? (
                        <>
                          <StatusGlyph status={dep.status} />
                          <span className="gaz-how">{STATUS_LABEL[dep.status]}</span>
                        </>
                      ) : (
                        <span className="gaz-how">Not settled</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <section className="legend" aria-labelledby="legend-heading">
        <h2 id="legend-heading">The six ways a place is drawn</h2>
        <dl>
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
    </div>
  );
}
