import buble from 'rollup-plugin-buble'
import cleanup from 'rollup-plugin-cleanup'
import eslint from 'rollup-plugin-eslint'
import filesize from 'rollup-plugin-filesize';

export default {
  entry: 'lib/index.js',
  format: 'cjs',
  treeshake: false,
  plugins: [
    eslint(),
    buble({ objectAssign: 'Object.assign' }),
    cleanup(),
    filesize()
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
