import buble from 'rollup-plugin-buble'
import cleanup from 'rollup-plugin-cleanup'

export default {
  entry: 'lib/index.js',
  format: 'cjs',
  treeshake: false,
  plugins: [ buble(), cleanup() ],
  dest: 'dist/bundle.js',
  // comments for generated bundle //
  banner: [
    '/** machine generated, do not edit **/',
    '',
    '/* eslint-disable */'
  ].join('\n')
}
