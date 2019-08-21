import fs from 'fs'
import bc from '@babel/core'
import str2b64 from 'wsemi/src/str2b64.mjs'

//fnIIFE
let fnIIFE = 'srcTemp/WConverwsClient.iife.js'

//codeIIFE
let codeIIFE = fs.readFileSync(fnIIFE, 'utf8')

//clear (ws);
codeIIFE = codeIIFE.replace('(ws);', '();')

//fnWorker
let fnWorker = 'src/webworker.mjs'

//codeWorker
let codeWorker = fs.readFileSync(fnWorker, 'utf8')

//complie and minify
codeWorker = bc.transform(codeWorker, {
    presets: [
        'minify',
        {
            comments: false,
        },
        ['@babel/preset-env', {
            'useBuiltIns': 'entry',
            'corejs': 3
        }]
    ]
})
codeWorker = codeWorker.code

//clear "use strict";
codeWorker = codeWorker.replace('"use strict";', '')

//codeMerge
let codeMerge = codeIIFE + codeWorker

//fnMerge
let fnMerge = 'srcTemp/WConverwsClient_WebworkerMerge.mjs'

//save
fs.writeFileSync(fnMerge, codeMerge, 'utf8')

//base64
let codeB64 = str2b64(codeMerge)

//fnB64
let fnB64 = 'srcTemp/WConverwsClient_WebworkerMerge.b64'

//save
fs.writeFileSync(fnB64, codeB64, 'utf8')

