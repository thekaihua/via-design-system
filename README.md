# via design system

Accessible React components for dashboards and admin tools: forms, data tables, charts, an app
shell, overlays and feedback, with light and dark themes. Built on
[React Aria Components](https://react-spectrum.adobe.com/react-aria/), styled with CSS Modules and
design tokens, documented and tested in Storybook.

## Install

```sh
npm install via-design-system react react-dom
```

React 19 is a peer dependency. Import the stylesheets once, at your app's root:

```tsx
import 'via-design-system/fonts.css';   // Nunito, Roboto Slab, JetBrains Mono (skip if you load your own)
import 'via-design-system/styles.css';  // tokens, base styles and every component's styles
```

Then use the components:

```tsx
import { Button, TextField } from 'via-design-system';

export function Example() {
  return (
    <form>
      <TextField label="Business name" />
      <Button type="submit">Save</Button>
    </form>
  );
}
```

The package ships ES modules, one per component, so your bundler only includes what you import.
Types are included.

### Theming

All styles use CSS custom properties named `--via-…`. Set `data-theme="dark"` on `<html>` for the
dark theme. To rebrand, override the tokens you need after importing the stylesheet:

```css
:root {
  --via-semantic-action-background: #5b3cc4;
}
```

`via-design-system/tokens.css` and `via-design-system/tokens.json` contain the tokens on their own.

Pass your own logo to the header with `<AppHeader logo={<YourLogo />} productName="Your product" />`.

## Documentation

The Storybook is the documentation: every component with its states, keyboard behaviour,
accessibility notes, patterns and example screens. Run it locally with `npm run storybook`.

## Develop

Requires Node 22 (see `.nvmrc`).

```sh
npm install
npx playwright install chromium   # one-time: browser for the tests
npm run storybook                 # http://localhost:6006
```

| Command | What it does |
| --- | --- |
| `npm run storybook` | Storybook dev server |
| `npm test` | Every story in Chromium (interactions + axe accessibility checks) and the token checks |
| `npm run typecheck` / `npm run lint` | TypeScript and oxlint |
| `npm run build` | The library in `dist/` |
| `npm run build-storybook` | Static Storybook in `storybook-static/` |
| `npm run tokens` | Regenerate `src/tokens/*` from the design file (maintainers only; see below) |

### Layout

```
src/components/   One folder per component: Component.tsx, .module.css, .stories.tsx
src/index.ts      Public API
src/tokens/       Generated tokens (tokens.css / .json / .ts) and the WCAG contrast checks
src/styles/       Fonts and base styles
src/patterns/, src/screens/, src/examples/   Story-only compositions and responsive/accessibility checks
src/docs/         Introduction, Foundations and pattern guidance (MDX)
```

### Tokens

Tokens are generated from a private design file and committed. Contributors don't need the file:
the generated tokens are the source for the code, and the contrast checks run on them. To propose a
token change, open an issue. Maintainers set the design file's path in `VIA_PEN_FILE` or a
git-ignored `.design-file`, then run `npm run tokens`.

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE). Fonts are under the SIL Open Font License (via `@fontsource`); icons are
[Lucide](https://lucide.dev) (ISC).
