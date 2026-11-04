/**
 * Helpers for story play functions (run in the browser).
 */

/**
 * Resolves a colour token to the computed rgb() string the browser uses, e.g. for comparing backgrounds.
 * Call it before waitFor(), never inside: it briefly adds an element, which re-triggers waitFor.
 */
export function tokenColor(cssVar: `--${string}`): string {
  const probe = document.createElement('span');
  probe.style.color = `var(${cssVar})`;
  document.body.appendChild(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

export const bg = (el: Element) => getComputedStyle(el).backgroundColor;
export const fg = (el: Element) => getComputedStyle(el).color;
export const outline = (el: Element) => {
  const s = getComputedStyle(el);
  return { width: s.outlineWidth, style: s.outlineStyle, offset: s.outlineOffset, color: s.outlineColor };
};
