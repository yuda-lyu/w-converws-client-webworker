import rollupFiles from 'w-package-tools/src/rollupFiles.mjs'


let fdSrc = './node_modules/w-converws/src/'
let fdTar = './srcTemp/'
let format = 'iife'
let bSourcemap = false
let bBanner = false


rollupFiles({
    fns: ['WConverwsClient.mjs'],
    fdSrc,
    fdTar,
    //nameDistType: 'kebabCase',
    format,
    bSourcemap,
    bBanner,
    globals: {
        'ws': 'ws',
        'events': 'events',
    },
    external: [
        'ws',
        'events',
    ],
})

