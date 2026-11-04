# Contributing

Thanks for helping. Changes go in through pull requests to `main`, reviewed by a maintainer.

## Before you start

- For anything bigger than a small fix, open an issue first so we can agree on the approach.
- Bugs: include the component, what you did, what you expected and what happened (a Storybook link or
  a minimal reproduction helps most).

## Making a change

1. Fork the repository and create a branch.
2. `npm install`, then `npx playwright install chromium` once.
3. Make the change. Keep to the conventions below.
4. Run `npm run typecheck`, `npm run lint` and `npm test`. All must pass.
5. Open a pull request describing what changed and why. Include screenshots for visual changes.

## Conventions

- **Accessibility is not optional.** Every story runs axe in the test suite; violations fail. Use
  React Aria Components for interactive behaviour. Keyboard, focus and screen-reader behaviour must
  work, and text must survive 320 px reflow, 200% zoom and WCAG text spacing.
- **Tokens only.** Style with `var(--via-…)` custom properties, never literal colours or sizes.
  Token values come from the design file; propose changes in an issue.
- **Every component has stories,** and behaviour is tested with `play` functions.
- **Props:** booleans are `disabled`, `loading`, `checked`; handlers are `onChange`, `onClick`.
- No new runtime dependencies without discussion.

## Code of conduct

Be respectful and constructive. Harassment or personal attacks aren't tolerated; maintainers may
remove comments or block contributors who don't follow this.
