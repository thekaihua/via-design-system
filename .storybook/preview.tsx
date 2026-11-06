import type { Decorator, Preview } from '@storybook/react-vite';
import '../src/styles/global.css';

export type Theme = 'light' | 'dark';

/**
 * Sets data-theme on the preview root (<html> inside the story iframe).
 * Dark token values live on [data-theme="dark"]; light values on :root.
 */
const withTheme: Decorator = (Story, context) => {
  const theme = (context.globals.theme ?? 'light') as Theme;
  document.documentElement.setAttribute('data-theme', theme);
  return <Story />;
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Colour theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [withTheme],
  parameters: {
    layout: 'padded',
    backgrounds: { disable: true },
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    // Test viewports from the design's Examples page (Responsive & accessibility), plus the defaults.
    viewport: {
      options: {
        mobile1: { name: 'Small mobile 320 × 568', styles: { width: '320px', height: '568px' }, type: 'mobile' },
        reflow320: { name: 'Reflow 320', styles: { width: '320px', height: '640px' }, type: 'mobile' },
        mobile375: { name: 'Mobile 375', styles: { width: '375px', height: '812px' }, type: 'mobile' },
        landscape: { name: 'Short landscape 667 × 375', styles: { width: '667px', height: '375px' }, type: 'mobile' },
        zoom200: { name: '1280 at 200% zoom (640)', styles: { width: '640px', height: '400px' }, type: 'tablet' },
        nav800: { name: 'Navigation fit 800', styles: { width: '800px', height: '600px' }, type: 'tablet' },
        tablet: { name: 'Tablet 834', styles: { width: '834px', height: '1112px' }, type: 'tablet' },
        mobile2: { name: 'Large mobile 414', styles: { width: '414px', height: '896px' }, type: 'mobile' },
        desktop: { name: 'Desktop 1440', styles: { width: '1440px', height: '900px' }, type: 'desktop' },
      },
    },
    // Accessibility violations fail tests (Storybook UI and Vitest).
    a11y: {
      test: 'error',
      // Chart drawings (Recharts SVG) are hidden from assistive tech, and axe can't work out the colour
      // behind SVG text, so it reports every tick as "needs review". Their contrast is checked by the
      // token tests instead (Foundations → Contrast: chart axis labels at 4.5 : 1).
      context: { exclude: ['.recharts-surface'] },
    },
    options: {
      storySort: {
        order: [
          'Introduction',
          'Foundations',
          ['Tokens', 'Colour', 'Contrast', 'Typography', 'Spacing and shape', 'Focus and elevation', 'Motion', 'Layout, layers and icons'],
          '*',
          'Setup',
        ],
      },
    },
  },
  tags: ['autodocs'],
};

export default preview;
