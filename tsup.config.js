import {defineConfig} from 'tsup'

export default defineConfig({
  entry: {
    'index': 'src/lib/index.ts',
    'worker': 'src/lib/fileID/ShaComputeWorker.ts',
  },
  splitting: true,
  treeshake: true,
  sourcemap: true,
  clean: true,
  dts:true,
  minify:true,
  format: ['cjs', 'esm'],
})
