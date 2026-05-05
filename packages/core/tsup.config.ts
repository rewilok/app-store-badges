import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    registry: 'src/registry.ts',
    elements: 'src/elements.ts',
  },
  format: ['esm'],
  target: 'es2022',
  dts: true,
  clean: true,
  splitting: true,
  treeshake: true,
  sourcemap: true,
  loader: {
    '.svg': 'text',
  },
});
