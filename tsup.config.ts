// import { defineConfig } from 'tsup';

// export default defineConfig({
//   entry: ['src/index.tsx'],
//   format: ['cjs', 'esm'],
//   dts: true,
//   external: ['react', 'react-dom'],
//   clean: true,
// });





// import { defineConfig } from 'tsup';

// export default defineConfig({
//   entry: ['src/index.tsx', 'src/index.css'], // Include CSS
//   format: ['cjs', 'esm'],
//   dts: true,
//   external: ['react', 'react-dom', 'framer-motion', 'lucide-react', 'tailwindcss'],
//   clean: true,
//   sourcemap: true,
//   esbuildOptions(options) {
//     options.outExtension = {
//       '.js': '.mjs',
//       '.css': '.css',
//     };
//   },
// });





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