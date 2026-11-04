// Library entry: the public API plus the stylesheet (tokens, base styles, component styles).
// The build extracts the CSS into dist/via.css. Fonts ship separately as dist/fonts.css, which imports the
// @fontsource packages so the app's bundler serves the font files.
import './tokens/tokens.css';
import './styles/base.css';

export * from './index';
