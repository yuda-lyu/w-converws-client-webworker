import rollupFiles from 'w-package-tools/src/rollupFiles.mjs'


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

