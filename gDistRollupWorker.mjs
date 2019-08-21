import _ from 'lodash'
import fs from 'fs'


let fd_src = 'srcTemp/'
let fd_tar = 'dist/'
let fn_rollup_src = '.rollup.mjs'
let fn_rollup_tar = '.rollupWorker'
let nameType = 'kebabCase'
let format = 'umd'
let sourcemap = true
let banner = true


async function main() {
    //讀取src內函數與rollup範本(.rollup.mjs), 再自動生成rollup設定檔, 供rollup打包個別組件與整體組件

    //r
    let r = fs.readFileSync(fn_rollup_src, 'utf8')

    //getFiles
    let ltfs = ['WConverwsClientWebworker.mjs']

    //get name
    ltfs = _.map(ltfs, function(v) {
        return v.replace('.mjs', '')
    })

    //cps
    let cps = JSON.stringify(ltfs)

    //c
    let c = r
    c = c.replace('{fd_src}', fd_src)
    c = c.replace('{fd_tar}', fd_tar)
    c = c.replace('{cps}', cps)
    c = c.replace('{nameType}', nameType)
    c = c.replace('{format}', format)
    c = c.replace('{sourcemap}', sourcemap)
    c = c.replace('{banner}', banner)

    //write
    //console.log(c)
    fs.writeFileSync(fn_rollup_tar, c, 'utf8')

}
main()
