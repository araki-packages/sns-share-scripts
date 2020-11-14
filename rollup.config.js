import resolve from "@rollup/plugin-node-resolve";
import ts from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import dts from "rollup-plugin-dts";
import camelCase from "lodash.camelcase";
import upperFirst from "lodash.upperfirst";
const tsconfig = require( './tsconfig.json');

import pkg from "./package.json";

// Scopeを除去する
const moduleName = upperFirst(camelCase(pkg.name.replace(/^\@.*\//, "")));

// ライブラリに埋め込むcopyright
const banner = `/*!
  ${moduleName}.js v${pkg.version}
  ${pkg.homepage}
  Released under the ${pkg.license} License.
*/`;

export default [
  // ブラウザ用設定
  {
    // エントリポイント
    input: "lib/index.ts",
    output: [
      // minifyせずに出力する
      {
        // exportされたモジュールを格納する変数
        name: moduleName,
        // 出力先ファイル
        file: pkg.browser,
        // ブラウザ用フォーマット
        format: "iife",
        // ソースマップをインラインで出力
        sourcemap: "inline",
        // copyright
        banner,
      },
      // minifyして出力する
      {
        name: moduleName,
        // minifyするので.minを付与する
        file: pkg.browser.replace(".js", ".min.js"),
        format: "iife",
        banner,
        // minify用プラグインを追加で実行する
        plugins: [terser()],
      },
    ],
    // 開発用モジュールは含めない
    external: [...Object.keys(pkg.devDependencies || {})],
    plugins: [
      resolve(),
      ts(tsconfig.compilerOptions),
      commonjs({ extensions: [".ts", ".js", ".tsx", ".jsx"] }),
    ],
  },
  // モジュール用設定
  {
    input: "lib/index.ts",
    output: [
      // CommonJS用出力
      {
        file: pkg.main,
        format: "cjs",
        sourcemap: "inline",
        banner,
      },
      // ESモジュール用出力
      {
        file: pkg.module,
        format: "es",
        sourcemap: "inline",
        banner,
      },
    ],
    // 他モジュールは含めない
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
    ],
    plugins: [
      resolve(),
      ts(tsconfig.compilerOptions),
      commonjs({ extensions: [".ts", ".js", ".tsx", ".jsx"] }),
    ],
  },
  {
    input: "lib/index.ts",
    output: [{ file: "types/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
];
