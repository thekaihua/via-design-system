import tokens from './tokens.json';
import type { TokenName } from './tokens';

export type Theme = 'light' | 'dark';

type TokenEntry = { type: string; value: Record<Theme, string | number> };
const table = tokens.tokens as unknown as Record<string, TokenEntry>;

export function tokenValue(name: TokenName, theme: Theme): string | number {
  const t = table[name];
  if (!t) throw new Error(`Unknown token ${name}`);
  return t.value[theme];
}

type RGBA = [number, number, number, number];

export function parseHex(hex: string): RGBA {
  let h = hex.replace('#', '');
  if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
  return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
}

/** Composites a possibly translucent colour over an opaque backdrop. */
function over([r, g, b, a]: RGBA, [br, bg, bb]: RGBA): RGBA {
  return [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a), 1];
}

function luminance([r, g, b]: RGBA): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG 2.x contrast ratio between two hex colours (foreground may be translucent). */
export function contrastRatio(fg: string, bg: string): number {
  const back = parseHex(bg);
  const front = over(parseHex(fg), back);
  const [l1, l2] = [luminance(front), luminance(back)].sort((a, b) => b - a);
  return (l1 + 0.05) / (l2 + 0.05);
}

export type ContrastPair = {
  fg: TokenName;
  bg: TokenName;
  /** 4.5 for text, 3 for large text and non-text UI (borders, focus rings, chart marks). */
  min: 4.5 | 3;
  use: string;
  /** Known design issue, tracked until the .pen file is fixed. The test then expects this pair to fail. */
  knownIssue?: Partial<Record<Theme, string>>;
};

const text = (fg: TokenName, bg: TokenName, use: string): ContrastPair => ({ fg, bg, min: 4.5, use });
const ui = (fg: TokenName, bg: TokenName, use: string): ContrastPair => ({ fg, bg, min: 3, use });

/** Colour pairings the components rely on. Checked in both themes by src/tokens/tokens.test.ts. */
export const contrastPairs: ContrastPair[] = [
  ...(['default', 'subtle', 'raised', 'hover', 'selected'] as const).flatMap((s) => [
    text('via.semantic.text.primary', `via.semantic.surface.${s}`, `Body text on ${s} surface`),
    text('via.semantic.text.secondary', `via.semantic.surface.${s}`, `Secondary text on ${s} surface`),
  ]),
  text('via.semantic.text.link', 'via.semantic.surface.default', 'Links'),
  text('via.semantic.text.link', 'via.semantic.surface.subtle', 'Links on subtle surface'),
  text('via.semantic.action.foreground', 'via.semantic.action.background', 'Primary button'),
  text('via.semantic.action.foreground', 'via.semantic.action.hover', 'Primary button, hover'),
  text('via.semantic.action.foreground', 'via.semantic.action.pressed', 'Primary button, pressed'),
  text('via.semantic.destructive.foreground', 'via.semantic.destructive.background', 'Destructive button'),
  text('via.semantic.destructive.foreground', 'via.semantic.destructive.hover', 'Destructive button, hover'),
  text('via.semantic.destructive.foreground', 'via.semantic.destructive.pressed', 'Destructive button, pressed'),
  ...(['error', 'success', 'warning', 'info', 'neutral'] as const).flatMap((s) => [
    text(`via.semantic.${s}.foreground`, `via.semantic.${s}.background`, `${s} badge or banner`),
    text(`via.semantic.${s}.foreground`, 'via.semantic.surface.default', `${s} text on page`),
  ]),
  text('via.semantic.navigation.active.foreground', 'via.semantic.navigation.active.background', 'Active navigation item'),
  text('via.semantic.tooltip.foreground', 'via.semantic.tooltip.background', 'Tooltip'),
  ui('via.semantic.action.background', 'via.semantic.navigation.active.background', 'Current setup task icon'),
  text('via.semantic.success.foreground', 'via.semantic.surface.raised', 'Completed task status on a card'),
  text('via.semantic.warning.foreground', 'via.semantic.surface.raised', 'Needs-attention task status on a card'),
  text('via.semantic.error.foreground', 'via.semantic.surface.raised', 'Destructive menu item'),
  text('via.semantic.text.secondary', 'via.semantic.navigation.active.background', 'Secondary text in a selected row or bulk bar'),
  text('via.semantic.text.primary', 'via.semantic.navigation.active.background', 'Text in a selected row or bulk bar'),
  ui('via.semantic.border.control', 'via.semantic.surface.default', 'Field and control borders'),
  ui('via.semantic.border.control', 'via.semantic.surface.subtle', 'Field borders on subtle surface'),
  ui('via.semantic.focus.ring', 'via.semantic.surface.default', 'Focus ring'),
  ui('via.semantic.focus.ring', 'via.semantic.surface.subtle', 'Focus ring on subtle surface'),
  ui('via.semantic.action.background', 'via.semantic.surface.default', 'Primary button against page'),
  ...([1, 2, 3, 4, 5, 6] as const).map((i) =>
    ui(`via.chart.series.${i}`, 'via.semantic.surface.default', `Chart series ${i}`),
  ),
  ui('via.chart.axis', 'via.semantic.surface.default', 'Chart axis labels (graphical)'),
];

// Add entries as 'fg|bg': { light?: 'reason', dark?: 'reason' } while a design fix is pending.
const issues: Record<string, ContrastPair['knownIssue']> = {};
for (const p of contrastPairs) {
  const issue = issues[`${p.fg}|${p.bg}`];
  if (issue) p.knownIssue = issue;
}

export function checkPair(pair: ContrastPair, theme: Theme) {
  const ratio = contrastRatio(String(tokenValue(pair.fg, theme)), String(tokenValue(pair.bg, theme)));
  return { ...pair, theme, ratio, pass: ratio >= pair.min };
}
