import typescript from 'rollup-plugin-typescript2';
import tslint from 'rollup-plugin-tslint';
import commonjs from 'rollup-plugin-commonjs';
import external from 'rollup-plugin-peer-deps-external';
// import postcss from 'rollup-plugin-postcss-modules'
import postcss from 'rollup-plugin-postcss';
import resolve from 'rollup-plugin-node-resolve';
import url from 'rollup-plugin-url';
import svgr from '@svgr/rollup';

import pkg from './package.json';

const modules = pkg.files;

const plugins = [
  external(),

  postcss({
    modules: true
  }),
  url(),
  svgr(),
  tslint({}),
  typescript({
    rollupCommonJSResolveHack: true,
    clean: true
  }),
  resolve({ modules: true }),
  commonjs()
];

export default modules.map(name => ({
  input: { index: `src/${name}.ts` },
  output: {
    dir: name,
    format: 'cjs',
    exports: 'named',
    sourcemap: true
  },
  plugins
}));
