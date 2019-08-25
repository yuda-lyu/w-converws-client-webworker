import fs from 'fs'
import bc from '@babel/core'
import str2b64 from 'wsemi/src/str2b64.mjs'
import replace from 'wsemi/src/replace.mjs'


function getCodePromise() {

    //fnPromise
    let fnPromise = 'node_modules/promise-polyfill/dist/polyfill.min.js'

    //codePromise
    let codePromise = fs.readFileSync(fnPromise, 'utf8')

    return codePromise
}


function getCodeIIFE() {

    //fnIIFE
    let fnIIFE = 'srcTemp/WConverwsClient.iife.js'

    //codeIIFE
    let codeIIFE = fs.readFileSync(fnIIFE, 'utf8')

    //clear (ws)
    codeIIFE = codeIIFE.replace('(ws)', '()')

    return codeIIFE
}


function getCodeWorker() {

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

    return codeWorker
}


function clearCode(code) {

    //clear "use strict";
    code = replace(code, '"use strict";', '')
    code = replace(code, '\'use strict\';', '')

    //clear \n
    code = replace(code, '\n', '')

    return code
}


function main() {

    //codeMerge
    let codeMerge = getCodePromise() + getCodeIIFE() + getCodeWorker()

    //clearCode
    codeMerge = clearCode(codeMerge)

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

}
main()

