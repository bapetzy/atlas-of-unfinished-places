import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { STATUS_LABEL } from '../data/editions';
import type { Status } from '../data/types';
import { go } from '../state/router';

/** The chart's six ways of drawing a place, as a symbol small enough for a table cell. */
export function StatusGlyph({ status, label = false }: { status: Status; label?: boolean }) {
  return (
    <span className={`status status-${status}`}>
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        {status === 'stands' && <circle cx="8" cy="8" r="5" className="s-fill" />}
        {status === 'proposed' && <circle cx="8" cy="8" r="5" className="s-line" strokeDasharray="3.2 2" />}
        {status === 'struck' && (
          <>
            <circle cx="8" cy="8" r="5" className="s-line" />
            <path d="M2 14L14 2" className="s-cancel" />
          </>
        )}
        {status === 'doubtful' && <circle cx="8" cy="8" r="5" className="s-line" strokeDasharray="0.6 2.6" strokeLinecap="round" />}
        {status === 'ruin' && <rect x="3.5" y="3.5" width="9" height="9" className="s-line" strokeDasharray="1.4 1.6" />}
        {status === 'absent' && <path d="M5 8H11" className="s-faint" />}
      </svg>
      {label ? <span>{STATUS_LABEL[status]}</span> : <span className="visually-hidden">{STATUS_LABEL[status]}</span>}
    </span>
  );
}

interface StateLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
}

/**
 * A link that changes what the sheet shows without adding to the back button's history.
 * Still a real link: it can be copied, or opened in another tab.
 */
export function StateLink({ href, children, onClick, ...rest }: StateLinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    go(href, true);
  };
  return (
    <a href={href} onClick={handle} {...rest}>
      {children}
    </a>
  );
}

/** Record text: [[place-id|words]] links to a place, _underscores_ set italic. */
export function Rich({ text, linkFor }: { text: string; linkFor?: (placeId: string) => string }) {
  const parts = text.split(/(\[\[[^\]]+\]\]|_[^_]+_)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('[[')) {
          const [id, words] = part.slice(2, -2).split('|');
          return linkFor ? (
            <a key={i} href={linkFor(id)}>
              {words}
            </a>
          ) : (
            words
          );
        }
        if (part.length > 2 && part.startsWith('_') && part.endsWith('_')) return <em key={i}>{part.slice(1, -1)}</em>;
        return part;
      })}
    </>
  );
}

/** The same text with its markup removed, for searching and for titles read aloud. */
export function plain(text: string): string {
  return text.replace(/\[\[[^|\]]+\|([^\]]+)\]\]/g, '$1').replace(/_([^_]+)_/g, '$1');
}
