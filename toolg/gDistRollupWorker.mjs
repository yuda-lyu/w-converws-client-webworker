import rollupFiles from '../tool/rollupFiles.mjs'
//import getFiles from '../tool/getFiles.mjs'


let fdSrc = './srcTemp/'
let fdTar = './dist/'


rollupFiles({
    fns: ['WConverwsClientWebworker.mjs'],
    fdSrc,
    fdTar,
    nameDistType: 'kebabCase',
    globals: {
        'ws': 'ws',
        'events': 'events',
    },
    external: [
        'ws',
        'events',
    ],
})

