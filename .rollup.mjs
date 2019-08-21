import vue from 'rollup-plugin-vue'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import postcss from 'rollup-plugin-postcss'
import babel from 'rollup-plugin-babel'
import buble from 'rollup-plugin-buble'
import replace from 'rollup-plugin-replace'
import minify from 'rollup-plugin-babel-minify'
import fs from 'fs'
import _ from 'lodash'


let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
//let env = process.env.NODE_ENV


let optBabel = {
    runtimeHelpers: true,
    //exclude: 'node_modules/**', //can not exclude node_modules, need compile wsemi
    presets: [
        [
            '@babel/preset-env',
            {
                useBuiltIns: 'entry', //entry usage, usage is not stable
                corejs: 3,
            }
        ]
    ],
}


let optPlugins = [
    vue(),
    // replace({
    //     'process.env.NODE_ENV': JSON.stringify(env)
    //   }),
    commonjs(),
    resolve({
        preferBuiltins: false,
        browser: true,
    }),
    babel(optBabel),
    //buble(),
    postcss({
        extensions: ['.css']
    }),
    minify({ comments: false, }),
]


let fd_src = '{fd_src}'
let fd_tar = '{fd_tar}'
let cps = {cps}
let nameType = '{nameType}'
let format = '{format}'
let bSourcemap = {sourcemap}
let bBanner = {banner}


function transName(name, type) {
    if (type === 'kebabCase') {
        return _.kebabCase(name)
    }
    return name
}


let rs = _.map(cps, function(v) {
    let name = transName(v, nameType)
    let input = `${fd_src}${v}.mjs`
    let file = `${fd_tar}${name}.${format}.js`
    let banner = `/*!\n * ${name} v${pkg.version}\n * (c) 2018-2019 ${pkg.author}\n * Released under the MIT License.\n */`
    if (!bBanner) {
        banner = null
    }
    let opt = {
        input: input,
        output: {
            banner: banner,
            globals: { //指定哪些外部模組的名稱，左邊為內部模組名稱，右邊為外部提供模組名稱
                'ws': 'ws',
                'events': 'events',
            },
            format: format,
            name: name,
            file: file,
            sourcemap: bSourcemap
        },
        external: [ //指定哪些模組需視為外部模組
            'ws',
            'events',
        ],
        plugins: optPlugins
    }
    return opt
})


export default rs
