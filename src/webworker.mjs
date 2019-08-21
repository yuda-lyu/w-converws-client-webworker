
//self.importScripts('w-converws-client.umd.js')


//WConverwsClient
//let WConverwsClient = self['w-converws-client']


//此處需引用w-converws-client的iife程式碼直接取得WConverwsClient


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
    wo = new WConverwsClient(opt)
    wo.on('open', function() {
        //console.log('wk: open')
        systemMessage('open')
    })
    wo.on('openOnce', function() {
        //console.log('wk: openOnce')
        systemMessage('openOnce')

        //bInit
        bInit = true

    })
    wo.on('close', function() {
        //console.log('wk: close')
        systemMessage('close')
    })
    wo.on('error', function(err) {
        //console.log('wk: error', err)
        systemMessage('error', err)
    })
    wo.on('reconn', function() {
        //console.log('wk: reconn')
        systemMessage('reconn')
    })
    wo.on('broadcast', function(data) {
        //console.log('wk: broadcast', data)
        systemMessage('broadcast', data)
    })
    wo.on('deliver', function(data) {
        //console.log('wk: deliver', data)
        systemMessage('deliver', data)
    })

}


//systemMessage
function systemMessage(func, data = null) {

    //msg
    let msg = {
        _id: 'system',
        func,
        data
    }

    //postMessage
    postMessage(msg)

}


//onmessage
onmessage = function (e) {

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

                //postMessage
                postMessage(msg)

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

            //postMessage
            postMessage(msg)

        })
            .then(function(output) {
                //console.log('execute: output=', output)

                //msg
                let msg = {
                    _id,
                    output,
                }

                //postMessage
                postMessage(msg)

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

            //postMessage
            postMessage(msg)

        })

    }
    else {
        systemMessage('error', `type error: ${type}`)
    }

}
