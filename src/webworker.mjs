//WConverwsClient
//self.importScripts('w-converws-client.umd.js')
//let WConverwsClient = self['w-converws-client']


//此處需引用w-converws-client的iife及壓縮過的程式碼, 直接取得WConverwsClient
//此處還需要添加promise, 因為可能用於ie11環境


//wo, bInit
let wo = null
let bInit = false


//init
function init(opt) {

    //check
    if (bInit) {
        return
    }

    //wo, 注意webworker.mjs是直接提供程式碼, 故此處WConverwsClient因無import會被eslint提示錯誤
    wo = new WConverwsClient(opt) //ie11會因為websocket於webworker內, 被視為需受安全性控管, 得將伺服器加入信賴區域, 或是移除限制
    wo.on('open', function() {
        //console.log('wk: open')
        sendSystemMessage('open')
    })
    wo.on('openOnce', function() {
        //console.log('wk: openOnce')
        sendSystemMessage('openOnce')

        //bInit
        bInit = true

    })
    wo.on('close', function() {
        //console.log('wk: close')
        sendSystemMessage('close')
    })
    wo.on('error', function(err) {
        //console.log('wk: error', err)
        sendSystemMessage('error', err)
    })
    wo.on('reconn', function() {
        //console.log('wk: reconn')
        sendSystemMessage('reconn')
    })
    wo.on('broadcast', function(data) {
        //console.log('wk: broadcast', data)
        sendSystemMessage('broadcast', data)
    })
    wo.on('deliver', function(data) {
        //console.log('wk: deliver', data)
        sendSystemMessage('deliver', data)
    })

}


//toCloneable, 將不可structured clone之值改為可複製之摘要, 僅於postMessage拋DataCloneError時使用
//Event(如WebSocket之error事件)取type, Error取message, 函數為'[Function]', 其餘不可複製之值取String; 陣列與純物件逐欄處理以保留可複製之欄位, 巢狀以10層為限
//處理範圍限於實際會送出之形狀: w-converws-client之{ msg, err }(err為Error, Event, 字串, JSON資料或巢狀{ msg, err })與伺服器傳來之JSON資料
function toCloneable(v, depth = 0) {
    let t = typeof v
    if (t === 'function') {
        return '[Function]'
    }
    if (v === null || t !== 'object') {
        return t === 'symbol' ? String(v) : v
    }
    if (v instanceof Event) {
        return v.type
    }
    if (v instanceof Error) {
        return v.message
    }
    if (depth < 10 && Array.isArray(v)) {
        return v.map((x) => toCloneable(x, depth + 1))
    }
    if (depth < 10 && Object.prototype.toString.call(v) === '[object Object]') {
        let o = Object.create(null) //null原型使'__proto__'鍵如一般鍵保留
        Object.keys(v).forEach((k) => {
            o[k] = toCloneable(v[k], depth + 1)
        })
        return o
    }
    return String(v)
}


//sendMessage, postMessage拋DataCloneError時改送摘要, 仍送不出(如通道已關閉)則放棄, 不外拋以免worker崩潰
function sendMessage(data) {
    try {
        self.postMessage(data)
    }
    catch (err) {
        try {
            self.postMessage(toCloneable(data))
        }
        catch (err2) {
            //放棄
        }
    }
}


//sendSystemMessage
function sendSystemMessage(func, data = null) {

    //msg
    let msg = {
        _id: 'system',
        func,
        data
    }

    //sendMessage
    sendMessage(msg)

}


//onmessage
self.onmessage = function (e) {

    //input
    let data = e.data

    //type
    let type = data.type

    if (type === 'init') {

        //_id
        let _id = data._id

        //opt
        let opt = data.input

        //init
        init(opt)

        //detect
        let t = setInterval(() => {
            if (bInit) {

                //msg
                let msg = {
                    _id,
                    output: null,
                }

                //sendMessage
                sendMessage(msg)

                //clearInterval
                clearInterval(t)

            }
        }, 10)

    }
    else if (type === 'execute') {

        //_id
        let _id = data._id

        //func
        let func = data.func

        //input
        let input = data.input

        //execute
        wo.execute(func, input, function (prog) {
            //console.log('execute prog=', prog)

            //msg
            let msg = {
                _id,
                prog,
            }

            //sendMessage
            sendMessage(msg)

        })
            .then(function(output) {
                //console.log('execute: output=', output)

                //msg
                let msg = {
                    _id,
                    output,
                }

                //sendMessage
                sendMessage(msg)

            })

    }
    else if (type === 'broadcast' || type === 'deliver') {

        //_id
        let _id = data._id

        //input
        let input = data.input

        //broadcast or deliver
        wo[type](input, function (prog) {

            //msg
            let msg = {
                _id,
                prog,
            }

            //sendMessage
            sendMessage(msg)

        })

    }
    else {
        sendSystemMessage('error', `type error: ${type}`)
    }

}
