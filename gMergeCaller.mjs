import fs from 'fs'


function main() {

    //fnCaller
    let fnCaller = 'src/webcaller.mjs'

    //codeCaller
    let codeCaller = fs.readFileSync(fnCaller, 'utf8')

    //fnB64
    let fnB64 = 'srcTemp/WConverwsClient_WebworkerMerge.b64'

    //base64
    let codeB64 = fs.readFileSync(fnB64, 'utf8')

    //codeMerge
    let codeMerge = codeCaller.replace('{codeB64}', codeB64)

    //fnMerge
    let fnMerge = 'srcTemp/WConverwsClientWebworker.mjs'

    //save
    fs.writeFileSync(fnMerge, codeMerge, 'utf8')

}
main()
