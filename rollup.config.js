import resolve from 'rollup-plugin-node-resolve'
import nodePolyfills from 'rollup-plugin-polyfill-node'
import common from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-replace'
import json from 'rollup-plugin-json'
import tsPlugin from "rollup-plugin-ts"
import { eslint } from 'rollup-plugin-eslint'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import { version } from './package.json'
export default {
    input: 'lib/index.ts',
    output: {
        file: 'build/wuji-rtm-sdk.js',
        format: 'umd',
        sourcemap: true,
        name: 'WujiRTM'
    },
    plugins: [
        resolve({
            preferBuiltins: true
        }),
        nodePolyfills(),
        common(),
        json(),
        replace({
            __BUILD_VERSION__: version
        }),
        eslint({ fix: true }),
        tsPlugin({
            tsconfig: "tsconfig.json",
            // browserslist: ["> 0.25%", "not dead"],
            babelConfig: {
                exclude: 'node_modules/**',
                presets: ["@babel/preset-env",
                    "@babel/preset-typescript"],
                extends: ['ts', '.ts']
            }
        }),
        serve({
            port: 4001,
            contentBase: './build'
        }),
        livereload({
            watch: './build/wuji-rtm-sdk.js'
        })
    ]
}