import buble from 'rollup-plugin-buble'

export default {
  entry: 'src/index.js',
  format: 'cjs',
  plugins: [ buble() ],
  dest: 'dist/bundle.js',
  // comments for generated bundle //
  banner: '/*** machine generated, do not edit ***/'
}
