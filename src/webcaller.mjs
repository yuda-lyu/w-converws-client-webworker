import genID from 'wsemi/src/genID.mjs'
import genPm from 'wsemi/src/genPm.mjs'
import Evem from 'wsemi/src/evem.mjs'
import isfun from 'wsemi/src/isfun.mjs'
//import b642u8arr from 'wsemi/src/b642u8arr.mjs'
import b642str from 'wsemi/src/b642str.mjs'


//codeB64, 此處需提供worker執行程式碼, 因有特殊符號編譯困難, 故需先轉base64再使用
let codeB64 = '{codeB64}'

//code
//let code = b642u8arr(codeB64)
let code = b642str(codeB64)


function genWebWorker(code) {

    //URL
    let URL = window.URL || window.webkitURL

    //blob
    let blob
    try {
        //BlobBuilder for IE11, 依然有安全性問題
        let BlobBuilder = window.BlobBuilder ||
            window.WebKitBlobBuilder ||
            window.MozBlobBuilder ||
            window.MSBlobBuilder
        blob = new BlobBuilder()
        blob.append(code)
        blob = blob.getBlob()
        return new Worker(URL.createObjectURL(blob))
    }
    catch (e) {
        //console.log('can not use BlobBuilder', e)
    }

    try {
        //blob for Chrome 8+, Firefox 6+, Safari 6.0+, Opera 15+
        blob = new Blob([code])
        return new Worker(URL.createObjectURL(blob))
    }
    catch (e) {
        //console.log('can not use Blob', e)
    }

    try {
        //data:application/javascript for Opera 10.60 - 12
        return new Worker('data:application/javascript,' + encodeURIComponent(code))
    }
    catch (e) {
        //console.log('can not use application/javascript', e)
    }

    return null
}


/**
 * 於瀏覽器(Browser)通過Web Worker建立WebSocket使用者端物件
 *
 * 監聽error事件所得資料之形狀，及其與非Web Worker版w-converws-client之差異:
 *
 * 1. 形狀: 與w-converws-client相同，為{ msg: String, err: * }，msg為'can not create websocket'、'websocket error'、'can not find _id and output in data'、'can not send message'等。另外Worker端收到未知type時，資料為字串'type error: <type>'(此為本套件Worker端自身通報，非w-converws-client之形狀)
 * 2. 差異: 非Web Worker版之err為原物件(如瀏覽器WebSocket之Event物件)；本套件之資料需經postMessage(structured clone)由Worker傳回呼叫端，而Event、函數、Symbol等不可複製之值會使postMessage拋DataCloneError。故Worker端照原資料傳送，拋DataCloneError時才改送可複製之摘要，此時呼叫端收到的err為摘要而非原物件
 * 3. 摘要規則: 可複製之欄位(字串、數字、null、陣列、純物件等)保留；Event(如WebSocket連線錯誤事件)改為其type字串(通常為'error')；Error改為其message字串；函數改為'[Function]'；其餘不可複製之值與巢狀超過10層者改為String(值)。例如連不上伺服器時收到{ msg: 'websocket error', err: 'error' }
 * 4. 可複製之err(字串、JSON資料，及瀏覽器支援複製Error時之Error物件)不轉換，原樣傳回；摘要仍無法送出時(如通道已關閉)該則訊息放棄，不使Worker崩潰
 * 5. 因此呼叫端無法取得原Event物件(含target)
 *
 * broadcast與deliver事件、execute結果之資料來自伺服器端之JSON，本即可複製，原樣傳回。
 *
 * @class
 * @param {Object} opt 輸入設定參數物件
 * @param {String} [opt.url='ws://localhost:8080'] 輸入WebSocket伺服器ws網址，預設為'ws://localhost:8080'
 * @param {String} [opt.token='*'] 輸入使用者認證用token，預設為'*'
 * @param {Integer} [opt.strSplitLength=1000000] 輸入傳輸封包長度整數，預設為1000000
 * @returns {Object} 回傳通訊物件，可監聽事件open、openOnce、close、error、reconn、broadcast、deliver，可使用函數execute、broadcast、deliver
 * @example
 *
 * <script src="dist/w-converws-client-webworker.umd.js"></script>
 *
 * let opt = {
 *     url: 'ws://localhost:8080',
 *     token: '*',
 * }
 *
 * //new
 * let WConverwsClient = window['w-converws-client-webworker']
 * let wo = new WConverwsClient(opt)
 *
 * wo.on('open', function() {
 *     console.log('client web: open')
 * })
 * wo.on('openOnce', function() {
 *     console.log('client web: openOnce')
 *
 *     //execute
 *     wo.execute('add', { p1: 1, p2: 2 },
 *         function (prog) {
 *             console.log('client web: execute prog=', prog)
 *         })
 *         .then(function(r) {
 *             console.log('client web: execute: add=', r)
 *         })
 *
 *     //broadcast
 *     wo.broadcast('client web broadcast hi', function (prog) {
 *         console.log('client web: broadcast prog=', prog)
 *     })
 *
 *     //deliver
 *     wo.deliver('client deliver hi', function (prog) {
 *         console.log('client web: deliver prog=', prog)
 *     })
 *
 * })
 * wo.on('close', function() {
 *     console.log('client web: close')
 * })
 * wo.on('error', function(err) {
 *     console.log('client web: error=', err)
 *     //連不上伺服器時, err為{ msg: 'websocket error', err: 'error' }, 其err為字串摘要
 * })
 * wo.on('reconn', function() {
 *     console.log('client web: reconn')
 * })
 * wo.on('broadcast', function(data) {
 *     console.log('client web: broadcast=', data)
 * })
 * // wo.on('deliver', function(data) { //伺服器目前無法針對client直接deliver
 * //     console.log('client web: deliver=', data)
 * // })
 *
 */
function WConverwsClientWebworker(opt) {


    //ee
    let ee = new Evem()


    //wk
    // let blob = new Blob([code], { type: 'text/javascript' })
    // let url = URL.createObjectURL(blob)
    // let wk = new Worker(url)
    // let wk = new Worker('./wkapi/wscs_webworker.mjs')
    let wk = genWebWorker(code)


    //check, IE11安全性問題
    if (wk === null) {
        return null
    }


    function init(opt) {

        //_id
        let _id = genID()

        //msg
        let msg = {
            _id,
            type: 'init',
            input: opt,
        }

        //postMessage
        wk.postMessage(msg)

    }
    init(opt)


    function terminate() {
        wk.terminate()
        wk = undefined
    }


    function execute(func, input, callback) {

        //pm
        let pm = genPm()

        //_id
        let _id = genID()

        //msg
        let msg = {
            _id,
            type: 'execute',
            func,
            input,
        }

        //postMessage
        wk.postMessage(msg)

        //等待結果回傳
        ee.on(_id, function (data) {

            //prog
            if (data.prog) {

                if (isfun(callback)) {

                    //callback
                    callback(data.prog)

                }

            }
            //output
            else {

                //resolve
                pm.resolve(data.output)

                //removeAllListeners
                ee.removeAllListeners(_id)

            }

        })

        return pm
    }


    function core(type, input, callback) {

        //pm
        let pm = genPm()

        //_id
        let _id = genID()

        //msg
        let msg = {
            _id,
            type,
            input,
        }

        //postMessage
        wk.postMessage(msg)

        //等待結果回傳
        ee.on(_id, function (data) {

            //callback
            if (isfun(callback)) {
                callback(data.prog)
            }

            //finish
            if (data.prog === 100) {

                //resolve
                pm.resolve()

                //removeAllListeners
                ee.removeAllListeners(_id)

            }

        })

        return pm
    }


    function broadcast(input, callback) {
        return core('broadcast', input, callback)
    }


    function deliver(input, callback) {
        return core('deliver', input, callback)
    }


    wk.onmessage = function (e) {

        //data
        let data = e.data

        //_id
        let _id = data._id

        if (_id !== 'system') {

            //emit
            ee.emit(_id, data)

        }
        else {

            //emit
            ee.emit(data.func, data.data)

        }

    }


    //save
    ee.execute = execute
    ee.broadcast = broadcast
    ee.deliver = deliver
    ee.terminate = terminate


    return ee
}


export default WConverwsClientWebworker
