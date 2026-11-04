// Ships the generated tokens on their own (for apps that want the variables without the components) and the
// font stylesheet, which imports the @fontsource packages so the app's bundler serves the font files.
import { copyFileSync } from 'node:fs';
const copy = (from, to) => copyFileSync(new URL(`../src/${from}`, import.meta.url), new URL(`../dist/${to}`, import.meta.url));
copy('tokens/tokens.css', 'tokens.css');
copy('tokens/tokens.json', 'tokens.json');
copy('styles/fonts.css', 'fonts.css');
