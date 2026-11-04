import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkPair, contrastPairs, contrastRatio, tokenValue, type Theme } from './contrast';

const root = path.resolve(__dirname, '../..');
// The design file is private; without it (VIA_PEN_FILE or .design-file) the sync checks are skipped.
const configured = process.env.VIA_PEN_FILE ?? (existsSync(path.join(root, '.design-file')) ? readFileSync(path.join(root, '.design-file'), 'utf8').trim() : '');
const penFile = configured ? path.resolve(root, configured) : '';

describe('generated tokens', () => {
  it.skipIf(!existsSync(penFile))('match the design file (run `npm run tokens` if this fails)', () => {
    expect(() =>
      execFileSync('node', [path.join(root, 'scripts/build-tokens.mjs'), '--check'], { stdio: 'pipe' }),
    ).not.toThrow();
  });

  // Pencil can't bind a frame's width to a variable, so the masters hold a plain number. Keep them in step.
  it.skipIf(!existsSync(penFile))('FocusView masters are via.size.focus-view wide', () => {
    const doc = JSON.parse(readFileSync(penFile, 'utf8'));
    const expected = doc.variables['via.size.focus-view']?.value;
    const masters: { name: string; width: unknown }[] = [];
    const walk = (n: { name?: string; reusable?: boolean; width?: unknown; children?: unknown[] }) => {
      if (n.reusable && /^Overlay \/ Focus view/.test(n.name ?? '')) masters.push({ name: n.name!, width: n.width });
      (n.children as (typeof n)[] | undefined)?.forEach(walk);
    };
    doc.children.forEach(walk);
    expect(expected, 'via.size.focus-view token').toBeTypeOf('number');
    expect(masters.length).toBeGreaterThan(0);
    for (const m of masters) expect(m.width, m.name).toBe(expected);
  });

  it('never chain var() aliases (export rule)', () => {
    const css = readFileSync(path.join(__dirname, 'tokens.css'), 'utf8');
    expect(css).not.toMatch(/var\(/);
  });
});

describe.each<Theme>(['light', 'dark'])('WCAG contrast, %s theme', (theme) => {
  it.each(contrastPairs.map((p) => [`${p.use}: ${p.fg} on ${p.bg} ≥ ${p.min}`, p] as const))('%s', (_, pair) => {
    const result = checkPair(pair, theme);
    const issue = pair.knownIssue?.[theme];
    if (issue) {
      // Known issue: fails today. When the design file is fixed this assertion fails; remove the entry in contrast.ts.
      expect(result.ratio, `Known issue fixed? ${issue}`).toBeLessThan(pair.min);
      return;
    }
    expect(result.ratio, `${result.ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(pair.min);
  });
});

/*
 * Disabled text is exempt from WCAG contrast, but it must stay readable and must not look like
 * ordinary secondary text (a disabled tab looked identical to an unselected one before 1.2).
 */
describe.each<Theme>(['light', 'dark'])('Disabled colour, %s theme', (theme) => {
  const c = (name: Parameters<typeof tokenValue>[0]) => String(tokenValue(name, theme));
  const disabled = c('via.semantic.disabled.foreground');

  it('stays readable on the disabled fill (≥ 2.5:1)', () => {
    expect(contrastRatio(disabled, c('via.semantic.disabled.background'))).toBeGreaterThanOrEqual(2.5);
  });

  it('stays readable on the page (≥ 3:1)', () => {
    expect(contrastRatio(disabled, c('via.semantic.surface.default'))).toBeGreaterThanOrEqual(3);
  });

  it('is clearly different from secondary text (≥ 1.5:1 apart)', () => {
    expect(contrastRatio(disabled, c('via.semantic.text.secondary'))).toBeGreaterThanOrEqual(1.5);
  });
});
