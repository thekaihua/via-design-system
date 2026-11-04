/**
 * Documentation blocks for the Foundations pages. They read src/tokens/tokens.json,
 * so the pages update whenever tokens are regenerated from the design file.
 * Light and dark values are shown side by side from the resolved values,
 * independent of the toolbar theme.
 */
import type { CSSProperties, ReactNode } from 'react';
import tokens from '../../tokens/tokens.json';
import { checkPair, contrastPairs, type Theme } from '../../tokens/contrast';

type Entry = {
  type: 'color' | 'number' | 'string' | 'boolean';
  cssVar: string;
  themed: boolean;
  alias: string | null;
  value: Record<Theme, string | number>;
  css: Record<Theme, string>;
};

const all = tokens.tokens as unknown as Record<string, Entry>;

export function tokensWith(prefix: string, exclude: string[] = []): [string, Entry][] {
  return Object.entries(all).filter(
    // An exclude ending in '.' drops a whole group; otherwise it drops that exact token.
    ([name]) => name.startsWith(prefix) && !exclude.some((x) => (x.endsWith('.') ? name.startsWith(x) : name === x)),
  );
}

const S = {
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14, margin: '16px 0 32px' } as CSSProperties,
  th: {
    textAlign: 'left',
    fontWeight: 700,
    padding: '8px 12px 8px 0',
    borderBottom: '1px solid var(--via-semantic-border-decorative)',
    color: 'var(--via-semantic-text-secondary)',
    fontSize: 13,
  } as CSSProperties,
  td: {
    padding: '10px 12px 10px 0',
    borderBottom: '1px solid var(--via-semantic-border-decorative)',
    verticalAlign: 'middle',
  } as CSSProperties,
  code: { fontFamily: 'var(--via-font-mono)', fontSize: 12 } as CSSProperties,
  muted: { color: 'var(--via-semantic-text-secondary)', fontSize: 12 } as CSSProperties,
};

const Code = ({ children }: { children: ReactNode }) => <code style={S.code}>{children}</code>;

function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <table style={S.table}>
      <thead>
        <tr>
          {head.map((h) => (
            <th key={h} style={S.th} scope="col">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

function Swatch({ color, theme }: { color: string; theme: Theme }) {
  return (
    <span
      title={`${theme}: ${color}`}
      style={{
        display: 'inline-block',
        width: 56,
        height: 32,
        borderRadius: 'var(--via-radius-inner)',
        background: color,
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12)',
        // Checkerboard shows through translucent colours (e.g. the overlay scrim).
        backgroundImage:
          color.length === 9
            ? `linear-gradient(${color}, ${color}), repeating-conic-gradient(#ccc 0 25%, #fff 0 50%)`
            : undefined,
        backgroundSize: color.length === 9 ? 'auto, 12px 12px' : undefined,
      }}
    />
  );
}

/** Colour tokens with light and dark swatches. */
export function ColourTable({ prefix, exclude }: { prefix: string; exclude?: string[] }) {
  return (
    <Table head={['Token', 'Light', 'Dark', 'Values']}>
      {tokensWith(prefix, exclude).map(([name, t]) => (
        <tr key={name}>
          <td style={S.td}>
            <Code>{t.cssVar}</Code>
            {t.alias && <div style={S.muted}>→ {t.alias}</div>}
          </td>
          <td style={S.td}>
            <Swatch color={t.css.light} theme="light" />
          </td>
          <td style={S.td}>
            <Swatch color={t.css.dark} theme="dark" />
          </td>
          <td style={{ ...S.td, ...S.code }}>
            {t.css.light}
            {t.themed && <span style={S.muted}> / {t.css.dark}</span>}
          </td>
        </tr>
      ))}
    </Table>
  );
}

/** Contrast of the colour pairs components rely on, in both themes. */
export function ContrastTable() {
  return (
    <Table head={['Pairing', 'Required', 'Light', 'Dark']}>
      {contrastPairs.map((pair) => {
        const [l, d] = (['light', 'dark'] as const).map((theme) => checkPair(pair, theme));
        const cell = (r: typeof l) => {
          const fg = String(all[pair.fg].css[r.theme]);
          const bg = String(all[pair.bg].css[r.theme]);
          return (
            <td style={{ ...S.td, whiteSpace: 'nowrap' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '2px 10px',
                  borderRadius: 'var(--via-radius-inner)',
                  background: bg,
                  color: fg,
                  fontWeight: 700,
                  border: `1px solid ${fg}`,
                }}
              >
                Aa
              </span>{' '}
              <strong style={{ color: r.pass ? 'var(--via-semantic-success-foreground)' : 'var(--via-semantic-error-foreground)' }}>
                {r.ratio.toFixed(2)}:1 {r.pass ? 'Pass' : 'Fail'}
              </strong>
              {pair.knownIssue?.[r.theme] && <div style={{ ...S.muted, whiteSpace: 'normal', maxWidth: 260 }}>{pair.knownIssue[r.theme]}</div>}
            </td>
          );
        };
        return (
          <tr key={`${pair.fg}|${pair.bg}`}>
            <td style={S.td}>
              {pair.use}
              <div style={S.muted}>
                <Code>{pair.fg}</Code> on <Code>{pair.bg}</Code>
              </div>
            </td>
            <td style={S.td}>{pair.min}:1</td>
            {cell(l)}
            {cell(d)}
          </tr>
        );
      })}
    </Table>
  );
}

const SAMPLE = 'Create a sandbox service and test your webhooks. 0123456789';

/** Font family tokens with a sample in each. */
export function FontFamilies() {
  return (
    <Table head={['Token', 'Stack', 'Sample']}>
      {tokensWith('via.font.', ['via.font.fallback', 'via.font.fallback-serif']).map(([name, t]) => (
        <tr key={name}>
          <td style={S.td}>
            <Code>{t.cssVar}</Code>
          </td>
          <td style={{ ...S.td, ...S.muted, ...S.code }}>{t.css.light}</td>
          <td style={{ ...S.td, fontFamily: `var(${t.cssVar})`, fontSize: 16 }}>{SAMPLE}</td>
        </tr>
      ))}
    </Table>
  );
}

const typeUse: Record<string, { family: string; use: string }> = {
  'via.type.display': { family: '--via-font-display', use: 'Page hero, marketing headline' },
  'via.type.mobile-heading': { family: '--via-font-display', use: 'Display at narrow widths' },
  'via.type.form-title': { family: '--via-font-display', use: 'Form and focus-view titles' },
  'via.type.title': { family: '--via-font-display', use: 'Section titles, page headers' },
  'via.type.body': { family: '--via-font-ui', use: 'Reading text, descriptions' },
  'via.type.label': { family: '--via-font-ui', use: 'Buttons, labels, navigation, table headers (700)' },
  'via.type.support': { family: '--via-font-ui', use: 'Supporting copy' },
  'via.type.metadata': { family: '--via-font-ui', use: 'IDs, timestamps, metadata' },
};

/** Type scale rendered at size with the family the design uses for each step. */
export function TypeScale() {
  const sizes = tokensWith('via.type.')
    .filter(([n, t]) => t.type === 'number' && typeUse[n])
    .sort((a, b) => Number(b[1].value.light) - Number(a[1].value.light));
  return (
    <Table head={['Token', 'Size', 'Use', 'Sample']}>
      {sizes.map(([name, t]) => {
        const u = typeUse[name];
        const display = u.family === '--via-font-display';
        return (
          <tr key={name}>
            <td style={S.td}>
              <Code>{t.cssVar}</Code>
            </td>
            <td style={{ ...S.td, ...S.code }}>{t.css.light}</td>
            <td style={{ ...S.td, ...S.muted }}>{u.use}</td>
            <td
              style={{
                ...S.td,
                fontFamily: `var(${u.family})`,
                fontSize: `var(${t.cssVar})`,
                fontWeight: name === 'via.type.label' ? 700 : 400,
                lineHeight: display ? 1.15 : name === 'via.type.label' ? 'var(--via-type-label-line)' : 'var(--via-type-body-line)',
                letterSpacing: display ? 'var(--via-type-tracking-display)' : 'var(--via-type-tracking-ui)',
                color: display ? 'var(--via-semantic-text-link)' : undefined,
              }}
            >
              {display ? 'Go live with Acme Pay' : 'Payments overview'}
            </td>
          </tr>
        );
      })}
    </Table>
  );
}

/** Generic table: token, CSS value(s) and an optional visual. */
export function TokenTable({
  prefix,
  exclude,
  visual,
}: {
  prefix: string;
  exclude?: string[];
  visual?: (t: Entry, name: string) => ReactNode;
}) {
  return (
    <Table head={visual ? ['Token', 'Value', 'Preview'] : ['Token', 'Value']}>
      {tokensWith(prefix, exclude).map(([name, t]) => (
        <tr key={name}>
          <td style={S.td}>
            <Code>{t.cssVar}</Code>
          </td>
          <td style={{ ...S.td, ...S.code }}>
            {t.css.light}
            {t.themed && <span style={S.muted}> / {t.css.dark}</span>}
          </td>
          {visual && <td style={S.td}>{visual(t, name)}</td>}
        </tr>
      ))}
    </Table>
  );
}

export const SpaceBar = (t: Entry) => (
  <span
    style={{
      display: 'inline-block',
      height: 16,
      width: `var(${t.cssVar})`,
      background: 'var(--via-semantic-action-background)',
      borderRadius: 2,
    }}
  />
);

export const RadiusBox = (t: Entry) => (
  <span
    style={{
      display: 'inline-block',
      width: 96,
      height: 48,
      border: '2px solid var(--via-semantic-border-control)',
      borderRadius: `var(${t.cssVar})`,
      background: 'var(--via-semantic-surface-subtle)',
    }}
  />
);

/** A static focus ring on a pill button and a field, using the focus tokens. */
export function FocusDemo() {
  const ring: CSSProperties = {
    outline: 'var(--via-focus-width) solid var(--via-semantic-focus-ring)',
    outlineOffset: 'var(--via-focus-gap)',
  };
  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center', padding: '16px 0 32px' }}>
      <span
        style={{
          ...ring,
          display: 'inline-flex',
          alignItems: 'center',
          height: 32,
          padding: '0 16px',
          borderRadius: 'var(--via-radius-control)',
          background: 'var(--via-semantic-action-background)',
          color: 'var(--via-semantic-action-foreground)',
          fontWeight: 700,
          fontSize: 'var(--via-type-label)',
        }}
      >
        Create service
      </span>
      <span
        style={{
          ...ring,
          display: 'inline-flex',
          alignItems: 'center',
          width: 240,
          height: 40,
          padding: '0 12px',
          borderRadius: 'var(--via-radius-field)',
          border: '1px solid var(--via-semantic-border-control)',
          background: 'var(--via-semantic-surface-default)',
        }}
      >
        Production orders
      </span>
    </div>
  );
}
