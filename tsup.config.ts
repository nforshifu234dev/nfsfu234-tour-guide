import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm', 'cjs'], // Generate ES Modules and CommonJS
  dts: true, // Generate TypeScript declarations
  sourcemap: true, // Generate source maps
  clean: true, // Clean dist folder before build
  minify: false, // Disable minification to avoid mangling
  treeshake: true, // Enable tree-shaking
  splitting: false, // Disable code splitting to ensure single file
  outDir: 'dist',
  external: ['react', 'react-dom', 'framer-motion', 'lucide-react', 'tailwindcss'], // Mark dependencies as external
});