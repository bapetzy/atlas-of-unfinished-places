import { useEffect, useRef } from 'react';
import { gridRef } from '../carto/geometry';
import { ALL_EDITIONS, editionLabel, EDITIONS, STATUS_LABEL } from '../data/editions';
import { KEYSTONE, PLACES } from '../data/places';
import { depictionFor, isComplete, keystoneLocked, settledCount } from '../data/resolve';
import type { Findings, Place, RecordDoc } from '../data/types';
import { reader } from '../state/reader';
import { go, hrefWith, type Route } from '../state/router';
import { plain, Rich, StateLink, StatusGlyph } from './common';

/** Papers produced on a typewriter. Everything else on file is print or handwriting. */
const TYPED = new Set(['Unit memorandum', 'Office memorandum', 'Board minute']);

function showRecord(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
  el.classList.remove('is-cited');
  // Restart the highlight if the same paper is cited twice running.
  void el.offsetWidth;
  el.classList.add('is-cited');
  el.focus({ preventScroll: true });
}

function RecordSheet({ record, linkFor }: { record: RecordDoc; linkFor: (id: string) => string }) {
  const { body } = record;
  const hand = record.kind === 'Field note' ? ' is-hand' : '';
  const typed = TYPED.has(record.kind) ? ' is-typed' : '';
  return (
    <article className={`record form-${body.form}${hand}${typed}`} id={record.id} tabIndex={-1}>
      <header className="record-head">
        <p className="record-kind">
          {record.kind}, {record.date}
        </p>
        <h3>
          <Rich text={record.title} />
        </h3>
      </header>

      {body.form === 'prose' && (
        <div className="record-body">
          {body.paragraphs.map((p, i) => (
            <p key={i}>
              <Rich text={p} linkFor={linkFor} />
            </p>
          ))}
          {body.signoff && <p className="signoff">{body.signoff}</p>}
        </div>
      )}

      {body.form === 'entries' && (
        <dl className="record-body">
          {body.entries.map(([when, text], i) => (
            <div key={i}>
              <dt>{when}</dt>
              <dd>
                <Rich text={text} linkFor={linkFor} />
              </dd>
            </div>
          ))}
        </dl>
      )}

      {body.form === 'ledger' && (
        <div className="record-body">
          <table>
            <thead>
              <tr>
                {body.columns.map((c) => (
                  <th key={c} scope="col">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (j === 0 ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
          {body.foot && <p className="ledger-foot">{body.foot}</p>}
        </div>
      )}

      {body.form === 'wire' && (
        <div className="record-body">
          {body.lines.map((l, i) => (
            <p key={i}>{l}</p>
          ))}
        </div>
      )}

      {body.form === 'notice' && (
        <div className="record-body">
          <p className="notice-heading">{body.heading}</p>
          {body.paragraphs.map((p, i) => (
            <p key={i}>
              <Rich text={p} linkFor={linkFor} />
            </p>
          ))}
        </div>
      )}

      <footer className="record-foot">
        <span>{record.author}</span>
        {record.basis && <span className={`basis ed-${record.basis}`}>Relied on by Edition {EDITIONS[record.basis].numeral}</span>}
      </footer>
    </article>
  );
}

function Cites({ label, ids, place }: { label: string; ids: string[]; place: Place }) {
  if (ids.length === 0) return null;
  return (
    <span className="cites">
      {label}{' '}
      {ids.map((id, i) => {
        const record = place.records.find((r) => r.id === id);
        if (!record) return null;
        return (
          <span key={id}>
            {i > 0 && ', '}
            <button type="button" className="cite" onClick={() => showRecord(id)}>
              {record.kind.toLowerCase()} of {record.date.replace(/^(Found|Photographed|Postmarked) /, '')}
            </button>
          </span>
        );
      })}
      .
    </span>
  );
}

function FindingPanel({ place, findings, route }: { place: Place; findings: Findings; route: Route }) {
  const chosen = findings[place.id];
  const locked = place.id === KEYSTONE && keystoneLocked(findings);
  const remaining = PLACES.length - 1 - settledCount(findings) + (findings[KEYSTONE] ? 1 : 0);
  const question = useRef<HTMLParagraphElement>(null);

  return (
    <section className="finding" aria-labelledby="finding-heading">
      <h2 id="finding-heading">Your finding</h2>
      <p className="finding-question" ref={question} tabIndex={-1}>
        {place.finding.question}
      </p>

      {locked ? (
        <p className="finding-locked">
          The origin is heard last, because every other place on the sheet was measured from it. Settle the other{' '}
          {remaining === 1 ? 'place' : `${remaining} places`} first. <a href={hrefWith(route, { view: 'yours' })}>See what is left</a>.
        </p>
      ) : (
        <ul className="options">
          {place.finding.options.map((o) => (
            <li key={o.id} className={chosen === o.id ? 'is-chosen' : undefined}>
              <button
                type="button"
                aria-pressed={chosen === o.id}
                onClick={() => (chosen === o.id ? reader.withdraw(place.id) : reader.settle(place.id, o.id))}
              >
                {o.label}
              </button>
              <p className="rests">
                <Cites label="Rests on the" ids={o.cites} place={place} /> <Cites label="Sets aside the" ids={o.setsAside} place={place} />
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="finding-result" role="status">
        {chosen && (
          <>
            <span className="stamp">Entered in Edition V</span>
            <StateLink href={hrefWith(route, { ed: 'r' })}>See it on your sheet</StateLink>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                question.current?.focus();
                reader.withdraw(place.id);
              }}
            >
              Withdraw this finding
            </button>
          </>
        )}
      </div>

      {place.id === KEYSTONE && isComplete(findings) && (
        <p className="finding-reply">
          All ten places are settled. <a href={hrefWith(route, { view: 'yours' })}>The Survey Office has replied.</a>
        </p>
      )}
    </section>
  );
}

interface Props {
  placeId: string;
  place: Place | undefined;
  route: Route;
  findings: Findings;
}

export function Dossier({ placeId, place, route, findings }: Props) {
  const heading = useRef<HTMLHeadingElement>(null);
  const panel = useRef<HTMLElement>(null);
  const closeHref = hrefWith(route, { placeId: null });

  useEffect(() => {
    panel.current?.scrollTo({ top: 0 });
    heading.current?.focus({ preventScroll: true });
  }, [placeId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') go(closeHref);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeHref]);

  if (!place) {
    return (
      <aside className="dossier" ref={panel} aria-label="Papers">
        <a className="dossier-close" href={closeHref}>
          Close
        </a>
        <h1 ref={heading} tabIndex={-1}>
          Nothing is filed under “{placeId}”
        </h1>
        <p className="premise">
          No edition of this sheet letters a place by that name. The <a href={hrefWith(route, { view: 'gazetteer' })}>gazetteer</a> lists
          the ten that are on file.
        </p>
      </aside>
    );
  }

  const linkFor = (id: string) => hrefWith(route, { view: 'sheet', placeId: id });
  const index = PLACES.indexOf(place);
  const prev = PLACES[(index + PLACES.length - 1) % PLACES.length];
  const next = PLACES[(index + 1) % PLACES.length];
  const here = depictionFor(place, route.ed, findings);
  const otherNames = [...new Set(Object.values(place.depictions).map((d) => d.name))].filter((n) => n !== place.name);

  return (
    <aside className="dossier" ref={panel} aria-labelledby="dossier-heading">
      <a className="dossier-close" href={closeHref}>
        Close
      </a>

      <header className="dossier-head">
        <h1 id="dossier-heading" ref={heading} tabIndex={-1}>
          {place.name}
        </h1>
        <p className="dossier-meta">
          {place.kindLabel}, square {gridRef(place.at)}.
          {otherNames.length > 0 && <> Also lettered {otherNames.map((n) => `“${n}”`).join(', ')}.</>}
        </p>
        <p className="premise">{place.premise}</p>
      </header>

      <section aria-labelledby="drawn-heading">
        <h2 id="drawn-heading">How each edition draws it</h2>
        <ol className="drawn">
          {ALL_EDITIONS.map((id) => {
            const dep = depictionFor(place, id, findings);
            return (
              <li key={id}>
                <StateLink href={hrefWith(route, { ed: id })} aria-current={route.ed === id ? 'true' : undefined} className={`ed-${id}`}>
                  <span className="drawn-ed">
                    {EDITIONS[id].numeral}
                    <small>{EDITIONS[id].year ?? 'yours'}</small>
                  </span>
                  <StatusGlyph status={dep.status} />
                  <span className="drawn-how">
                    <strong>{dep.settled ? STATUS_LABEL[dep.status] : 'Not settled'}</strong>
                    {dep.status !== 'absent' && dep.settled && <> as “{dep.name}”</>}
                    {dep.note && dep.settled && <em>, {dep.note}</em>}
                  </span>
                </StateLink>
              </li>
            );
          })}
        </ol>
        {here.status === 'absent' && route.ed !== 'r' && (
          <p className="drawn-absent">{editionLabel(route.ed)} does not show this place, so there is nothing to see on the sheet.</p>
        )}
      </section>

      <section aria-labelledby="papers-heading">
        <h2 id="papers-heading">Papers on file</h2>
        <div className="records">
          {place.records.map((r) => (
            <RecordSheet key={r.id} record={r} linkFor={linkFor} />
          ))}
        </div>
      </section>

      <FindingPanel place={place} findings={findings} route={route} />

      <nav className="dossier-next" aria-label="Other places">
        <a href={linkFor(prev.id)}>
          <small>Previous</small>
          {plain(prev.name)}
        </a>
        <a href={linkFor(next.id)}>
          <small>Next</small>
          {plain(next.name)}
        </a>
      </nav>
    </aside>
  );
}
