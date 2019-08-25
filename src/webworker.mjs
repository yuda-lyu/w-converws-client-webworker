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

    //wo
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


//sendMessage
function sendMessage(data) {
    self.postMessage(data)
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
