import * as esbuild from 'esbuild'

const production = process.argv.includes('--production')

await esbuild.build({
  entryPoints: ['src/extension.ts'],
  outfile: 'dist/extension.js',
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node20',
  external: ['vscode', '@tailwindcss/oxide'],
  sourcemap: !production,
  minify: production,
})
