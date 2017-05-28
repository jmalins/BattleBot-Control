import buble from 'rollup-plugin-buble'
import cleanup from 'rollup-plugin-cleanup'

export default {
  entry: 'lib/index.js',
  format: 'cjs',
  treeshake: false,
  plugins: [
    buble({ objectAssign: 'Object.assign' }),
    cleanup()
  ],
  dest: 'build/bundle.js',
  sourceMap: true,
  // comments for generated bundle //
  banner: [
    '/** machine generated, do not edit **/',
    '',
    '/* eslint-disable */'
  ].join('\n')
}
