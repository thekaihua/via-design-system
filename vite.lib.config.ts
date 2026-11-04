// Library build: `npm run build` → dist/ (ES modules, one per source file so apps only bundle what they use).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = (await import('./package.json', { with: { type: 'json' } })).default as {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};
const deps = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})];
const external = (id: string) => deps.some((d) => id === d || id.startsWith(`${d}/`));

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: false,
    sourcemap: true,
    cssCodeSplit: false,
    lib: {
      entry: path.join(dirname, 'src/lib.ts'),
      formats: ['es'],
      cssFileName: 'via',
    },
    rollupOptions: {
      external,
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        assetFileNames: (a) => (a.names?.some((n) => n.endsWith('.css')) ? '[name][extname]' : 'assets/[name][extname]'),
      },
    },
  },
});
