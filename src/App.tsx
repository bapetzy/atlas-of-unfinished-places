import { useEffect } from 'react';
import { About } from './components/About';
import { Dossier } from './components/Dossier';
import { EditionRail } from './components/EditionRail';
import { Gazetteer } from './components/Gazetteer';
import { Sheet } from './components/sheet/Sheet';
import { Yours } from './components/Yours';
import { editionLabel } from './data/editions';
import { PLACE_BY_ID, PLACES } from './data/places';
import { settledCount } from './data/resolve';
import { useReader } from './state/reader';
import { hrefWith, useRoute, type Route, type View } from './state/router';

const ATLAS = 'The Atlas of Unfinished Places';

function titleFor(route: Route): string {
  if (route.view === 'sheet') {
    const place = route.placeId ? PLACE_BY_ID[route.placeId] : undefined;
    return `${place ? place.name : editionLabel(route.ed)} | ${ATLAS}`;
  }
  const names: Record<Exclude<View, 'sheet'>, string> = {
    gazetteer: 'Gazetteer',
    yours: 'Your edition',
    about: 'How to read this sheet',
    lost: 'Off the sheet',
  };
  return `${names[route.view]} | ${ATLAS}`;
}

export function App() {
  const route = useRoute();
  const { findings, slipDismissed } = useReader();
  const settled = settledCount(findings);

  useEffect(() => {
    document.title = titleFor(route);
  }, [route]);

  const nav: [View, string][] = [
    ['sheet', 'Sheet'],
    ['gazetteer', 'Gazetteer'],
    ['yours', `Your edition, ${settled} of ${PLACES.length}`],
    ['about', 'How to read it'],
  ];

  const theme = route.view === 'sheet' ? route.ed : route.view === 'yours' ? 'r' : 'i';

  return (
    <div className="app" data-ed={theme} data-view={route.view}>
      <a
        className="skip"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        Skip to the sheet
      </a>

      <header className="masthead">
        <a className="masthead-title" href={hrefWith(route, { view: 'sheet', placeId: null })}>
          <span className="masthead-name">{ATLAS}</span>
          <span className="masthead-sheet">Sheet 19, Morrowmouth and the Levels</span>
        </a>
        <nav className="masthead-nav" aria-label="Sections">
          {nav.map(([view, text]) => (
            <a key={view} href={hrefWith(route, { view, placeId: null })} aria-current={route.view === view ? 'page' : undefined}>
              {text}
            </a>
          ))}
        </nav>
      </header>

      <main id="main" className="frame" tabIndex={-1}>
        {route.view === 'sheet' && (
          <Sheet route={route} findings={findings} slipDismissed={slipDismissed}>
            {route.placeId && (
              <Dossier placeId={route.placeId} place={PLACE_BY_ID[route.placeId]} route={route} findings={findings} />
            )}
          </Sheet>
        )}
        {route.view === 'gazetteer' && <Gazetteer route={route} findings={findings} />}
        {route.view === 'yours' && <Yours route={route} findings={findings} />}
        {route.view === 'about' && <About route={route} />}
        {route.view === 'lost' && (
          <div className="page lost">
            <header className="page-head">
              <h1>Off the sheet</h1>
              <p className="page-lead">
                That address is not on Sheet 19. Nothing has been surveyed there, by anyone, in any edition.
              </p>
              <p className="page-actions">
                <a className="button" href={hrefWith(route, { view: 'sheet', placeId: null })}>
                  Go back to the sheet
                </a>
                <a href={hrefWith(route, { view: 'gazetteer' })}>Look through the gazetteer</a>
              </p>
            </header>
          </div>
        )}
      </main>

      {route.view === 'sheet' && <EditionRail route={route} />}
    </div>
  );
}
