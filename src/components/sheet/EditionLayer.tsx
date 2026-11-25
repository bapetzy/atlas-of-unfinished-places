import { memo, useEffect, useMemo, useState } from 'react';
import { blocks, GRID_SQUARE } from '../../carto/geometry';
import { cachedTerrain, getTerrain, SHEET_H, SHEET_W, terrainKey, type Terrain, type TerrainSpec } from '../../carto/terrain';
import { EDITIONS } from '../../data/editions';
import { linesFor, namesFor, riverPath, terrainSpec, TOWNS, type LineFeature } from '../../data/features';
import { PLACES } from '../../data/places';
import { depictionFor } from '../../data/resolve';
import type { EditionId, Findings } from '../../data/types';
import { PlaceMark } from './marks';

/** Plot an edition's ground off the main render, so the first paint is never held up by it. */
function useTerrain(spec: TerrainSpec): Terrain | null {
  const key = terrainKey(spec);
  const [, setPlotted] = useState('');
  useEffect(() => {
    if (cachedTerrain(spec)) return;
    const id = window.setTimeout(() => {
      getTerrain(spec);
      setPlotted(key);
    }, 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` stands for `spec`
  }, [key]);
  return cachedTerrain(spec) ?? null;
}

function Line({ f }: { f: LineFeature }) {
  if (f.kind === 'road') return <path className="road" d={f.d} />;
  return (
    <g className={`${f.kind === 'rail' ? 'railway' : 'canal'} mode-${f.mode}`}>
      <path className="bed" d={f.d} />
      <path className="dress" d={f.d} />
      {f.mode === 'struck' && <path className="cancel" d={f.d} />}
    </g>
  );
}

const GRID_X = Array.from({ length: SHEET_W / GRID_SQUARE - 1 }, (_, i) => (i + 1) * GRID_SQUARE);
const GRID_Y = Array.from({ length: SHEET_H / GRID_SQUARE - 1 }, (_, i) => (i + 1) * GRID_SQUARE);
const GRATICULE =
  GRID_X.map((x) => `M${x} 0V${SHEET_H}`).join('') + GRID_Y.map((y) => `M0 ${y}H${SHEET_W}`).join('');

interface Props {
  ed: EditionId;
  findings: Findings;
  /** The sheet itself, as opposed to the copy seen through the glass. */
  primary: boolean;
  activePlace: string | null;
  hrefFor: (placeId: string) => string;
}

function EditionLayerImpl({ ed, findings, primary, activePlace, hrefFor }: Props) {
  const spec = terrainSpec(ed, findings);
  const terrain = useTerrain(spec);
  const river = useMemo(() => riverPath(ed), [ed]);
  const lines = useMemo(() => linesFor(ed, findings), [ed, findings]);
  const names = useMemo(() => namesFor(ed), [ed]);
  const hatchId = `hatch-${ed}-${primary ? 'sheet' : 'glass'}`;

  return (
    <g className={`plate ed-${ed}`}>
      <defs>
        <pattern id={hatchId} width="5" height="5" patternUnits="userSpaceOnUse">
          <path className="hatch" d="M0 2.5H5" />
        </pattern>
      </defs>
      <rect className="sea" x={-40} y={-40} width={SHEET_W + 80} height={SHEET_H + 80} />
      {terrain ? (
        <>
          {terrain.water.map((d, i) => (
            <path key={i} className={`waterline w${i}`} d={d} />
          ))}
          <path className="land" d={terrain.land} />
          <path className="contour" d={terrain.contours} />
          <path className="contour index" d={terrain.indexContours} />
        </>
      ) : (
        <text className="plotting" x={SHEET_W / 2} y={SHEET_H / 2} textAnchor="middle">
          Plotting Edition {EDITIONS[ed].numeral}
        </text>
      )}
      <path className="graticule" d={GRATICULE} />
      <path className="river-bank" d={river} />
      <path className="river-water" d={river} />
      {lines.map((f) => (
        <Line key={f.id} f={f} />
      ))}
      {names.map((n) => (
        <text
          key={n.id}
          className={`name name-${n.cls}`}
          x={n.at[0]}
          y={n.at[1]}
          textAnchor="middle"
          transform={n.rotate ? `rotate(${n.rotate} ${n.at[0]} ${n.at[1]})` : undefined}
        >
          {n.text.split('\n').map((t, i) => (
            <tspan key={i} x={n.at[0]} dy={i === 0 ? 0 : '1.15em'}>
              {t}
            </tspan>
          ))}
        </text>
      ))}
      {TOWNS.map((t) => (
        <g key={t.id} className="town">
          <path d={blocks(t.at, t.count, t.spread, t.seed)} />
          <text className="name name-town" x={t.at[0] + t.label.dx} y={t.at[1] + t.label.dy} textAnchor={t.label.anchor}>
            {t.names[ed] ?? t.names.default}
          </text>
        </g>
      ))}
      {PLACES.map((p) => (
        <PlaceMark
          key={p.id}
          place={p}
          dep={depictionFor(p, ed, findings)}
          ed={ed}
          primary={primary}
          active={activePlace === p.id}
          href={hrefFor(p.id)}
          hatchId={hatchId}
        />
      ))}
    </g>
  );
}

export const EditionLayer = memo(EditionLayerImpl);
