import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.tsx' },
  format: ['esm'],
  target: 'es2022',
  dts: true,
  clean: true,
  splitting: true,
  treeshake: true,
  sourcemap: true,
  external: ['react', 'react-dom', '@rewilok/app-store-badges'],
});
