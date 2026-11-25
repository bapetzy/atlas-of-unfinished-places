import { blob, blocks, line, rectPath, spline, streetGrid } from '../../carto/geometry';
import { editionLabel, STATUS_LABEL } from '../../data/editions';
import type { Resolved } from '../../data/resolve';
import type { EditionId, Place, PlaceKind, Pt } from '../../data/types';

/** How far each kind of symbol reaches from its centre: sizes the hit area, focus ring and strike. */
const REACH: Record<PlaceKind, number> = {
  city: 84,
  island: 46,
  station: 16,
  district: 38,
  hall: 18,
  light: 15,
  bridge: 22,
  reservoir: 62,
  canal: 20,
  datum: 15,
};

interface GlyphProps {
  place: Place;
  dep: Resolved;
  at: Pt;
  hatchId: string;
}

function Glyph({ place, dep, at, hatchId }: GlyphProps) {
  const [x, y] = at;
  switch (place.kind) {
    case 'city':
      return (
        <>
          <path className="line fillable" d={rectPath(at, 150, 100, -14)} />
          <path className="line thin" d={streetGrid(at, 150, 100, 12.5, -14, 3, dep.status === 'ruin' ? 0.5 : 1)} />
          <path className="line square" d={rectPath(at, 25, 25, -14)} />
        </>
      );

    case 'island':
      if (dep.status === 'doubtful') return <circle className="line" cx={x} cy={y} r={44} />;
      return (
        <>
          <rect className="solid" x={x - 3} y={y - 2} width={6} height={5} />
          <path className="line" d={`M${x} ${y - 2}v-8M${x - 3} ${y - 7}h6`} />
        </>
      );

    case 'station':
      return (
        <>
          <rect className="solid" x={x - 10} y={y - 3.5} width={20} height={7} transform={`rotate(-15 ${x} ${y})`} />
          <circle className="flare" cx={x} cy={y} r={3.4} />
        </>
      );

    case 'district': {
      const plot = (
        <>
          <path className="line fillable" d={rectPath([0, 0], 60, 46)} />
          <path className="line thin" d={streetGrid([0, 0], 60, 46, 7.6, 0, 9)} />
        </>
      );
      return (
        <g transform={`translate(${x} ${y})`}>
          {dep.variant === 'turning' ? (
            <g className="turning">{plot}</g>
          ) : (
            <g transform={`rotate(${dep.angle ?? 0})`}>{plot}</g>
          )}
        </g>
      );
    }

    case 'hall':
      return (
        <>
          <path className="line fillable" d={rectPath(at, 26, 14, -8)} />
          <path className="line" d={rectPath([x + 1.2, y + 10], 11, 6, -8)} />
        </>
      );

    case 'light':
      return (
        <>
          {dep.variant === 'harbour' && (
            <>
              <path className="line basin" d={rectPath([x - 8, y + 56], 76, 44, -8)} />
              <path className="line" d={spline([[x - 30, y + 78], [596, 372], [566, 452], [552, 512]])} />
            </>
          )}
          {dep.variant === 'lit' && (
            <g transform={`translate(${x} ${y})`}>
              <g className="beam">
                <path d="M0 0L190 -13L190 13Z" />
              </g>
            </g>
          )}
          <path
            className="flare"
            d={`M${x} ${y}C${x + 4} ${y - 10} ${x + 12} ${y - 20} ${x + 19} ${y - 23}C${x + 17} ${y - 15} ${x + 10} ${y - 4} ${x} ${y}Z`}
          />
          <circle className="solid" cx={x} cy={y} r={3.6} />
          <path className="line" d={`M${x - 7} ${y}h-4M${x + 7} ${y}h4M${x} ${y + 7}v4M${x - 5} ${y + 5}l-3 3M${x + 5} ${y + 5}l3 3`} />
        </>
      );

    case 'bridge': {
      // Unit vector across the Morrow at Tolland, north bank to south.
      const nx = 0.217;
      const ny = 0.976;
      const north: Pt = [x - nx * 20, y - ny * 20];
      const end: Pt = dep.status === 'stands' ? [x + nx * 20, y + ny * 20] : [x + nx * 1.5, y + ny * 1.5];
      const span = line([north, end]);
      return (
        <>
          <path className="line deck-edge" d={span} />
          <path className="deck" d={span} />
          <path className="line" d={`M${north[0] - 6} ${north[1] + 1.4}l12 -2.8`} />
          {dep.status === 'stands' && <path className="line" d={`M${end[0] - 6} ${end[1] + 1.4}l12 -2.8`} />}
        </>
      );
    }

    case 'reservoir':
      if (dep.variant === 'lake') {
        return (
          <>
            <path className="lake" d={blob(at, 64, 31, 8)} style={{ fill: `url(#${hatchId})` }} />
            <path className="line dam" d={`M${x - 61} ${y - 17}L${x - 66} ${y + 15}`} />
          </>
        );
      }
      return (
        <>
          <path className="solid" d={blocks(at, 9, 15, 61)} />
          <path className="line" d={`M${x + 2} ${y - 20}v-9M${x - 1.5} ${y - 26}h7`} />
        </>
      );

    case 'canal':
      if (dep.variant === 'single') return null;
      return <path className="line fillable" d={rectPath(at, 11, 6, -24)} />;

    case 'datum':
      return (
        <>
          <path className="line strong" d={`M${x} ${y - 10}L${x + 9} ${y + 6}L${x - 9} ${y + 6}Z`} />
          <circle className="solid" cx={x} cy={y + 1} r={1.7} />
        </>
      );
  }
}

interface MarkProps {
  place: Place;
  dep: Resolved;
  ed: EditionId;
  /** The glass repeats the sheet's marks; only the sheet's are announced and tabbed to. */
  primary: boolean;
  active: boolean;
  href: string;
  hatchId: string;
}

export function PlaceMark({ place, dep, ed, primary, active, href, hatchId }: MarkProps) {
  const isReader = ed === 'r';
  // A survey that does not show a place gives the reader nothing to open.
  if (dep.status === 'absent' && !isReader) return null;

  const at = dep.at ?? place.at;
  const reach = REACH[place.kind];
  const lx = at[0] + place.label.dx;
  const ly = at[1] + place.label.dy;
  const drawn = dep.status !== 'absent';
  // The lettering is part of the target too, with a little room round it for a fingertip.
  const labelWidth = Math.max(dep.name.length, (dep.note ?? '').length * 0.72) * 8.6 + 12;
  const labelLeft = place.label.anchor === 'start' ? lx - 6 : place.label.anchor === 'end' ? lx - labelWidth + 6 : lx - labelWidth / 2;

  const classes = ['place', `kind-${place.kind}`, `st-${dep.status}`];
  if (!dep.settled) classes.push('unsettled');
  if (active) classes.push('is-active');

  const spoken = `${place.name}, ${place.kindLabel.toLowerCase()}. ${STATUS_LABEL[dep.status]} on ${editionLabel(ed)}${
    dep.note ? `: ${dep.note}` : ''
  }.`;

  return (
    <a
      href={href}
      className={classes.join(' ')}
      data-place={place.id}
      aria-label={primary ? spoken : undefined}
      aria-hidden={primary ? undefined : true}
      tabIndex={primary ? undefined : -1}
    >
      <circle className="hit" cx={at[0]} cy={at[1]} r={Math.max(reach, 22)} />
      <rect className="hit" x={labelLeft} y={ly - 16} width={labelWidth} height={dep.note ? 34 : 22} />
      <circle className="ring" cx={at[0]} cy={at[1]} r={reach + 9} />
      {drawn && <Glyph place={place} dep={dep} at={at} hatchId={hatchId} />}
      {dep.status === 'struck' && (
        <path
          className="strike"
          d={`M${at[0] - reach} ${at[1] + reach * 0.42}L${at[0] + reach} ${at[1] - reach * 0.42}M${at[0] - reach} ${at[1] - reach * 0.42}L${at[0] + reach} ${at[1] + reach * 0.42}`}
        />
      )}
      <text className={`label${drawn ? '' : ' gone'}`} x={lx} y={ly} textAnchor={place.label.anchor}>
        {dep.name}
      </text>
      {dep.note && (
        <text className="note" x={lx} y={ly + 12.5} textAnchor={place.label.anchor}>
          {dep.note}
        </text>
      )}
    </a>
  );
}
