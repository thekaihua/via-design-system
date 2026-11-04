/** Measurement helpers for the responsive and accessibility examples. */

/** Elements that stick out past the right edge of the viewport (WCAG 1.4.10 Reflow: no 2-D scrolling). */
export function overflowingElements(root: ParentNode = document): string[] {
  const vw = document.documentElement.clientWidth;
  const out: string[] = [];
  root.querySelectorAll<HTMLElement>('body *').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    // Content inside its own horizontal scroller (tables, code) is allowed to scroll.
    if (insideScroller(el)) return;
    if (r.right > vw + 1) out.push(describe(el, `right ${Math.round(r.right)} > ${vw}`));
  });
  return out.slice(0, 8);
}

function insideScroller(el: HTMLElement): boolean {
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    const ox = getComputedStyle(p).overflowX;
    if ((ox === 'auto' || ox === 'scroll') && p.scrollWidth > p.clientWidth) return true;
  }
  return false;
}

/**
 * Pairs of text runs that overlap on screen (a layout broke without leaving the viewport). Measures the
 * rendered lines of each text node, so words spilling out of a too-narrow box are caught too.
 */
export function overlappingText(root: ParentNode = document): string[] {
  const runs: { el: Element; text: string; r: DOMRect }[] = [];
  const walker = document.createTreeWalker(root as Node, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.textContent?.trim();
    const el = n.parentElement;
    if (!text || !el || el.closest('[aria-hidden="true"], .via-visually-hidden, svg, [role="tooltip"], script, style')) continue;
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) if (r.width > 1 && r.height > 1) runs.push({ el, text, r });
  }
  // Controls count as whole boxes: text must not run under a button's icon or border either.
  const controls = [...(root as ParentNode).querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [role="button"]')]
    .filter((c) => !c.closest('[aria-hidden="true"], .via-visually-hidden'))
    .map((c) => ({ el: c as Element, text: c.getAttribute('aria-label') ?? c.textContent?.trim() ?? '', r: c.getBoundingClientRect() }))
    .filter((c) => c.r.width > 1 && c.r.height > 1);
  const out: string[] = [];
  for (const a of runs)
    for (const c of controls) {
      if (c.el.contains(a.el)) continue;
      const w = Math.min(a.r.right, c.r.right) - Math.max(a.r.left, c.r.left);
      const h = Math.min(a.r.bottom, c.r.bottom) - Math.max(a.r.top, c.r.top);
      if (w > 2 && h > 2) out.push(`"${a.text.slice(0, 30)}" runs into control "${c.text.slice(0, 30)}"`);
      if (out.length >= 8) return out;
    }
  for (let i = 0; i < runs.length; i++)
    for (let j = i + 1; j < runs.length; j++) {
      const a = runs[i], b = runs[j];
      if (a.el === b.el) continue;
      const w = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      const h = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (w > 2 && h > 2) out.push(`"${a.text.slice(0, 30)}" overlaps "${b.text.slice(0, 30)}"`);
      if (out.length >= 8) return out;
    }
  return out;
}

/** Text that is cut off by a parent with overflow hidden (fails 1.4.4 / 1.4.12 when text grows). */
export function clippedText(root: ParentNode = document): string[] {
  const out: string[] = [];
  root.querySelectorAll<HTMLElement>('body *').forEach((el) => {
    const cs = getComputedStyle(el);
    if (cs.overflow !== 'hidden' && cs.overflowX !== 'hidden' && cs.overflowY !== 'hidden') return;
    if (cs.textOverflow === 'ellipsis') return; // truncation with a full value elsewhere is deliberate
    if (el.closest('[aria-hidden="true"], .via-visually-hidden, svg')) return;
    if (!el.textContent?.trim()) return;
    if (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2) out.push(describe(el, `${el.scrollWidth}×${el.scrollHeight} in ${el.clientWidth}×${el.clientHeight}`));
  });
  return out.slice(0, 8);
}

/** The WCAG 1.4.12 text-spacing override (line height 1.5, paragraphs 2×, letters 0.12em, words 0.16em). */
export function applyTextSpacing(): () => void {
  const style = document.createElement('style');
  style.textContent = `* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }`;
  document.head.append(style);
  return () => style.remove();
}

function describe(el: HTMLElement, why: string): string {
  const name = el.getAttribute('aria-label') ?? el.textContent?.trim().slice(0, 40) ?? '';
  return `<${el.tagName.toLowerCase()} class="${String(el.className).slice(0, 40)}"> "${name}" ${why}`;
}

export const nextFrame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
