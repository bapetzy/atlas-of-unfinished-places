import { useRef, useState } from 'react';
import { EDITIONS, SURVEY_EDITIONS } from '../data/editions';
import { KEYSTONE, PLACES } from '../data/places';
import { chosenOption, disagreements, isComplete, keystoneLocked, settledCount } from '../data/resolve';
import type { Findings } from '../data/types';
import { reader } from '../state/reader';
import { hrefWith, type Route } from '../state/router';

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

function Reply({ findings }: { findings: Findings }) {
  const counts = disagreements(findings);
  return (
    <article className="reply">
      <p className="reply-from">The Survey Office, Morrowmouth</p>
      <p>
        The Office acknowledges receipt of the Reader’s Reconciliation of Sheet 19, which has been entered as the Fifth
        Edition and filed with the other four. In accordance with practice it has the same authority as each of them.
      </p>
      <p>
        The Office notes that your edition differs from{' '}
        {SURVEY_EDITIONS.map((id, i) => (
          <span key={id}>
            {i > 0 && (i === SURVEY_EDITIONS.length - 1 ? ' and from ' : ', from ')}
            Edition {EDITIONS[id].numeral} in {WORDS[counts[id]]} {counts[id] === 1 ? 'place' : 'places'}
          </span>
        ))}
        . It agrees entirely with none. No edition has.
      </p>
      <p>
        You have fixed the origin of the survey. Each of your predecessors did the same, and each chose somewhere else.
        The Office does not say that you are wrong. It says only that a sheet with five editions is now a sheet with
        five disagreements where there were four.
      </p>
      <p>A Sixth Edition is in contemplation. It will be compiled by the next reader.</p>
      <p className="signoff">Keeper of Sheets</p>
    </article>
  );
}

export function Yours({ route, findings }: { route: Route; findings: Findings }) {
  const [confirming, setConfirming] = useState(false);
  /** True once the confirmation has been declined, so the button that opened it takes focus back. */
  const [declined, setDeclined] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const done = settledCount(findings);
  const complete = isComplete(findings);
  const locked = keystoneLocked(findings);

  return (
    <div className="page yours">
      <header className="page-head">
        <h1 ref={heading} tabIndex={-1}>
          Edition V
        </h1>
        <p className="page-lead">
          The Reader’s Reconciliation: your findings on the ten places, drawn in blue pencil over the newest survey.{' '}
          {done === 0
            ? 'Nothing is settled yet.'
            : complete
              ? 'All ten places are settled.'
              : `${WORDS[done][0].toUpperCase()}${WORDS[done].slice(1)} of ten ${done === 1 ? 'place is' : 'places are'} settled.`}
        </p>
        <div className="tally" role="img" aria-label={`${done} of ${PLACES.length} places settled`}>
          {PLACES.map((p) => (
            <span key={p.id} className={findings[p.id] ? 'is-done' : undefined} />
          ))}
        </div>
        <p className="page-actions">
          <a className="button" href={hrefWith(route, { view: 'sheet', placeId: null, ed: 'r' })}>
            Open your sheet
          </a>
          {!reader.isPersistent() && (
            <span className="warning">This browser is not keeping your edition. It will be lost when the page closes.</span>
          )}
        </p>
      </header>

      {complete && <Reply findings={findings} />}

      <ol className="findings">
        {PLACES.map((place) => {
          const opt = chosenOption(place, findings);
          const waits = place.id === KEYSTONE && locked;
          return (
            <li key={place.id} className={opt ? 'is-done' : undefined}>
              <h2>
                <a href={hrefWith(route, { view: 'sheet', placeId: place.id, ed: 'r' })}>{place.name}</a>
              </h2>
              <p className="findings-q">{place.finding.question}</p>
              {opt ? (
                <p className="findings-a">{opt.label}</p>
              ) : (
                <p className="findings-open">{waits ? 'Heard last, once the other nine are settled.' : 'Not settled.'}</p>
              )}
            </li>
          );
        })}
      </ol>

      {done > 0 && (
        <div className="withdraw">
          {confirming ? (
            <p role="group" aria-label="Withdraw all findings">
              Withdraw {done === 1 ? 'your one finding' : `all ${WORDS[done]} findings`}? Your sheet goes back to grey and this
              cannot be undone.{' '}
              <button
                type="button"
                className="danger"
                onClick={() => {
                  // Everything below is about to empty; put the keyboard at the top of the page.
                  heading.current?.focus();
                  reader.withdrawAll();
                  setConfirming(false);
                }}
              >
                Withdraw them
              </button>{' '}
              <button
                type="button"
                autoFocus
                onClick={() => {
                  setDeclined(true);
                  setConfirming(false);
                }}
              >
                Keep them
              </button>
            </p>
          ) : (
            <button type="button" className="text-button" autoFocus={declined} onClick={() => setConfirming(true)}>
              Withdraw all findings and start again
            </button>
          )}
        </div>
      )}

      <p className="kept">Your edition is kept in this browser and nowhere else.</p>
    </div>
  );
}
