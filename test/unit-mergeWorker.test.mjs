import fs from 'fs'
import net from 'net'
import path from 'path'
import vm from 'vm'
import assert from 'assert'
import { spawnSync } from 'child_process'
import { Worker, MessageChannel, receiveMessageOnPort } from 'worker_threads'
import { EventEmitter } from 'events'
import b642str from 'wsemi/src/b642str.mjs'


//本檔驗證「合併後worker程式碼」(promise polyfill + WConverwsClient iife + src/webworker.mjs 壓縮碼, 由toolg/gMergeWorker.mjs產製)
//1. 已提交產物(srcTemp/WConverwsClient_WebworkerMerge.mjs/.b64與dist內嵌之b64)
//2. 現場執行toolg/gMergeWorker.mjs於暫存資料夾所得產物(確保建置腳本於當前工具鏈安裝下仍可執行且產物可用)
//兩者皆須: 可解析(clearCode刪換行後仍合法)、以Web Worker語意載入後能對真實w-converws伺服器完成往返
//
//「Web Worker語意」於nodejs以worker_threads模擬: 補self、postMessage、onmessage轉接、WorkerGlobalScope(w-converws用以判斷處於Web Worker並改用self.WebSocket)


let fdTmp = path.resolve('test/_tmp/mergeWorker') //測試臨時檔, 測完於after刪除
let fpServer = path.resolve('node_modules/w-converws/dist/w-converws-server.umd.js')
let fpBuildScript = path.resolve('toolg/gMergeWorker.mjs')
let fnMerge = 'srcTemp/WConverwsClient_WebworkerMerge.mjs'
let fnB64 = 'srcTemp/WConverwsClient_WebworkerMerge.b64'
let fnDist = 'dist/w-converws-client-webworker.umd.js'
let timeoutWait = 30000 //等待單一事件之防懸置上限


//伺服器端(獨立執行緒, 結束時terminate以免殘留監聽), execute: add與echo
//WConverwsServer於建構後才非同步開始監聽, 故以TCP探測(事件驅動重試)確認可連線後才回報ready
let codeServer = `
{
    const net = require('net')
    const { parentPort, workerData } = require('worker_threads')
    const WConverwsServer = require(workerData.fpServer)
    const wo = new WConverwsServer({ port: workerData.port })
    function probe() {
        const s = net.connect(workerData.port, '127.0.0.1')
        s.once('connect', () => {
            s.destroy()
            parentPort.postMessage({ type: 'ready' })
        })
        s.once('error', () => {
            s.destroy()
            setTimeout(probe, 20)
        })
    }
    probe()
    wo.on('error', (err) => {
        parentPort.postMessage({ type: 'error', err: String((err && err.msg) || err) })
    })
    wo.on('execute', (func, input, callback) => {
        if (func === 'add') {
            callback(input.p1 + input.p2)
        }
        else if (func === 'echo') {
            callback(input)
        }
    })
    wo.on('broadcast', (data) => {
        parentPort.postMessage({ type: 'broadcast', data })
    })
    wo.on('deliver', (data) => {
        parentPort.postMessage({ type: 'deliver', data })
    })
}
`


//Web Worker環境前置碼, 置於區塊內避免const外洩至其後之合併碼(合併碼以classic script執行)
let codePrelude = `
{
    const { parentPort } = require('worker_threads')
    globalThis.self = globalThis
    globalThis.postMessage = (data) => {
        parentPort.postMessage(data)
    }
    globalThis.WorkerGlobalScope = class WorkerGlobalScope {
        static [Symbol.hasInstance](o) {
            return o === globalThis
        }
    }
    parentPort.on('message', (data) => {
        globalThis.onmessage({ data })
    })
}
`


//取得空閒埠(由作業系統配發後立即釋放, 同套件測試依序執行不會相撞)
function getFreePort() {
    return new Promise((resolve, reject) => {
        let srv = net.createServer()
        srv.once('error', reject)
        srv.listen(0, '127.0.0.1', () => {
            let port = srv.address().port
            srv.close(() => {
                resolve(port)
            })
        })
    })
}


//收件匣, 以事件同步(不以固定延時), timeoutWait僅為防懸置上限
function createInbox(worker, name) {
    let box = []
    let crashed = null
    let ee = new EventEmitter()
    worker.on('message', (m) => {
        box.push(m)
        ee.emit('msg', m)
    })
    worker.on('error', (err) => {
        crashed = err
        ee.emit('werr', err)
    })
    function wait(pred, label) {
        return new Promise((resolve, reject) => {
            let hit = box.find(pred)
            if (hit !== undefined) {
                resolve(hit)
                return
            }
            if (crashed) {
                reject(new Error(`${name} already crashed before waiting [${label}]: ${crashed && crashed.stack ? crashed.stack : crashed}`))
                return
            }
            let t = null
            let onMsg = (m) => {
                if (pred(m)) {
                    done()
                    resolve(m)
                }
            }
            let onErr = (err) => {
                done()
                reject(new Error(`${name} crashed while waiting [${label}]: ${err && err.stack ? err.stack : err}`))
            }
            function done() {
                clearTimeout(t)
                ee.off('msg', onMsg)
                ee.off('werr', onErr)
            }
            t = setTimeout(() => {
                done()
                reject(new Error(`${name} timeout waiting [${label}], received=${JSON.stringify(box).slice(0, 2000)}`))
            }, timeoutWait)
            ee.on('msg', onMsg)
            ee.on('werr', onErr)
        })
    }
    return { box, wait, getCrashed: () => crashed }
}


//現場執行建置腳本於暫存資料夾(複製其讀取之輸入檔), 回傳產出之merge與b64路徑
function buildMergeInTmp() {

    //暫存資料夾與輸入檔
    let fdCase = path.join(fdTmp, 'build')
    let copies = [
        ['src/webworker.mjs', 'src/webworker.mjs'],
        ['srcTemp/WConverwsClient.iife.js', 'srcTemp/WConverwsClient.iife.js'],
        ['node_modules/promise-polyfill/dist/polyfill.min.js', 'node_modules/promise-polyfill/dist/polyfill.min.js'],
    ]
    for (let [from, to] of copies) {
        let fpTo = path.join(fdCase, to)
        fs.mkdirSync(path.dirname(fpTo), { recursive: true })
        fs.copyFileSync(path.resolve(from), fpTo)
    }

    //腳本以cwd相對路徑讀寫, 故以暫存資料夾為cwd, 模組(terser, wsemi)仍由腳本所在套件解析
    let r = spawnSync(process.execPath, [fpBuildScript], { cwd: fdCase, windowsHide: true, encoding: 'utf8' })
    assert.strict.equal(r.status, 0, `build script exit=${r.status}, stderr=${String(r.stderr).slice(0, 2000)}`)

    return {
        fpMerge: path.join(fdCase, 'srcTemp/WConverwsClient_WebworkerMerge.mjs'),
        fpB64: path.join(fdCase, 'srcTemp/WConverwsClient_WebworkerMerge.b64'),
    }
}


//共用測試組, 對指定來源之合併碼進行驗證
function suite(title, getPaths) {

    describe(title, function() {
        this.timeout(120000)

        let fpMerge = null
        let fpB64 = null
        let code = null
        let wkServer = null
        let wkClient = null
        let inboxServer = null
        let inboxClient = null
        let port = null

        before(async function() {

            //paths
            let o = getPaths()
            fpMerge = o.fpMerge
            fpB64 = o.fpB64
            code = fs.readFileSync(fpMerge, 'utf8')

            //伺服器
            port = await getFreePort()
            wkServer = new Worker(codeServer, { eval: true, workerData: { fpServer, port } })
            inboxServer = createInbox(wkServer, 'server')
            await inboxServer.wait((m) => m.type === 'ready', 'server ready')

            //客戶端(被測之合併碼以Web Worker語意載入)
            wkClient = new Worker(codePrelude + '\n' + code, { eval: true })
            inboxClient = createInbox(wkClient, 'client')

        })

        after(async function() {
            if (wkClient) {
                await wkClient.terminate()
            }
            if (wkServer) {
                await wkServer.terminate()
            }
        })

        it('合併碼為單行(clearCode刪除換行)且可作為classic script解析', function() {

            //對應: gMergeWorker.mjs clearCode(刪除全部換行與use strict), 刪換行後須仍為合法程式
            assert.strict.equal(code.includes('\n'), false)
            assert.strict.equal(code.includes('\r'), false)
            assert.doesNotThrow(() => {
                new vm.Script(code, { filename: 'WConverwsClient_WebworkerMerge.mjs' }) //只編譯不執行
            })

        })

        it('合併碼含promise polyfill、WConverwsClient與worker入口', function() {

            //對應: src/webworker.mjs:6-8註解(需引用w-converws-client的iife及promise)與:125(self.onmessage)
            assert.strict.equal(code.includes('WConverwsClient'), true)
            assert.strict.equal(code.includes('self.onmessage'), true)
            assert.strict.equal(code.includes('Promise'), true)

        })

        it('.b64解碼後等於合併碼(webcaller.mjs以b642str還原後交給Worker)', function() {

            //對應: src/webcaller.mjs:10-14 codeB64經b642str還原為worker程式碼
            let b64 = fs.readFileSync(fpB64, 'utf8')
            assert.strict.equal(b642str(b64), code)

        })

        it('init: 回傳system open與openOnce(data為null), 並回覆{_id, output:null}', async function() {

            //對應: src/webworker.mjs:133-162(init後detect bInit, 回{_id, output:null}), :27,:31(system open/openOnce), :109-121(sendSystemMessage之data預設null)
            let opt = { url: `ws://127.0.0.1:${port}`, token: '*' }
            wkClient.postMessage({ _id: 'i1', type: 'init', input: opt })

            let mOpen = await inboxClient.wait((m) => m._id === 'system' && m.func === 'open', 'system open')
            assert.strict.deepEqual(mOpen, { _id: 'system', func: 'open', data: null })

            let mOpenOnce = await inboxClient.wait((m) => m._id === 'system' && m.func === 'openOnce', 'system openOnce')
            assert.strict.deepEqual(mOpenOnce, { _id: 'system', func: 'openOnce', data: null })

            let mInit = await inboxClient.wait((m) => m._id === 'i1', 'init reply')
            assert.strict.deepEqual(mInit, { _id: 'i1', output: null })

        })

        it('execute add: 回傳進度{_id, prog}與結果{_id, output:3}', async function() {

            //對應: src/webworker.mjs:164-202(wo.execute, 進度回調回{_id,prog}, 結果回{_id,output}); 伺服器add為p1+p2
            wkClient.postMessage({ _id: 'e1', type: 'execute', func: 'add', input: { p1: 1, p2: 2 } })

            let mOut = await inboxClient.wait((m) => m._id === 'e1' && Object.prototype.hasOwnProperty.call(m, 'output'), 'execute add output')
            assert.strict.deepEqual(mOut, { _id: 'e1', output: 3 })

            //進度訊息(若有)須為0~100之數字且不含output
            let progs = inboxClient.box.filter((m) => m._id === 'e1' && !Object.prototype.hasOwnProperty.call(m, 'output'))
            for (let m of progs) {
                assert.strict.equal(typeof m.prog, 'number')
                assert.strict.equal(m.prog >= 0 && m.prog <= 100, true)
            }

        })

        it('execute echo: 含中文、陣列、巢狀物件之輸入經往返後等值', async function() {

            //對應: src/webworker.mjs:164-202(execute輸入原樣送伺服器, 伺服器回傳原值)
            let input = { text: '中文abc\n"q"', arr: [1, 2, 3], nest: { a: null, b: true, c: 1.5 } }
            wkClient.postMessage({ _id: 'e2', type: 'execute', func: 'echo', input })

            let mOut = await inboxClient.wait((m) => m._id === 'e2' && Object.prototype.hasOwnProperty.call(m, 'output'), 'execute echo output')
            assert.strict.deepEqual(mOut, { _id: 'e2', output: input })

        })

        it('broadcast: 伺服器收到廣播資料, 客戶端回進度至100', async function() {

            //對應: src/webworker.mjs:204-226(type為broadcast時wo[type](input, cb), 回{_id,prog}; 完成為prog 100, 見src/webcaller.mjs:259)
            wkClient.postMessage({ _id: 'b1', type: 'broadcast', input: 'hi-broadcast' })

            let mProg = await inboxClient.wait((m) => m._id === 'b1' && m.prog === 100, 'broadcast prog 100')
            assert.strict.deepEqual(mProg, { _id: 'b1', prog: 100 })

            let mSrv = await inboxServer.wait((m) => m.type === 'broadcast', 'server broadcast')
            assert.strict.deepEqual(mSrv, { type: 'broadcast', data: 'hi-broadcast' })

        })

        it('deliver: 伺服器收到交付資料, 客戶端回進度至100', async function() {

            //對應: src/webworker.mjs:204-226(type為deliver時wo[type](input, cb))
            wkClient.postMessage({ _id: 'd1', type: 'deliver', input: 'hi-deliver' })

            let mProg = await inboxClient.wait((m) => m._id === 'd1' && m.prog === 100, 'deliver prog 100')
            assert.strict.deepEqual(mProg, { _id: 'd1', prog: 100 })

            let mSrv = await inboxServer.wait((m) => m.type === 'deliver', 'server deliver')
            assert.strict.deepEqual(mSrv, { type: 'deliver', data: 'hi-deliver' })

        })

        it('未知type: 回system error「type error: <type>」', async function() {

            //對應: src/webworker.mjs:227-229(else分支sendSystemMessage('error', `type error: ${type}`))
            wkClient.postMessage({ _id: 'x1', type: 'zzz' })

            let mErr = await inboxClient.wait((m) => m._id === 'system' && m.func === 'error', 'system error')
            assert.strict.deepEqual(mErr, { _id: 'system', func: 'error', data: 'type error: zzz' })

        })

        it('init連不上伺服器: 呼叫端收到system error(err為字串摘要), worker未崩潰且仍可回應', async function() {

            //對應: src/webworker.mjs:41-44 wo.on('error')經sendMessage送回之資料須可structured clone(拋DataCloneError時改送摘要; WebSocket錯誤事件Event不可複製, 原樣送出會DataCloneError使worker崩潰, 呼叫端收不到error)
            //此案獨立建立客戶端worker, 連至無任何監聽之埠(取得後即釋放)
            let portNone = await getFreePort()
            let wk = new Worker(codePrelude + '\n' + code, { eval: true })
            let inbox = createInbox(wk, 'client(connect refused)')
            try {

                wk.postMessage({ _id: 'ie1', type: 'init', input: { url: `ws://127.0.0.1:${portNone}`, token: '*' } })

                //呼叫端收到error事件, 資料形狀{msg, err}, Event改為其type字串
                let mErr = await inbox.wait((m) => m._id === 'system' && m.func === 'error', 'system error(connect refused)')
                assert.strict.deepEqual(Object.keys(mErr), ['_id', 'func', 'data'])
                assert.strict.deepEqual(Object.keys(mErr.data).sort(), ['err', 'msg'])
                assert.strict.equal(mErr.data.msg, 'websocket error')
                assert.strict.equal(mErr.data.err, 'error')

                //worker未崩潰, 且仍處理後續訊息
                assert.strict.equal(inbox.getCrashed(), null)
                wk.postMessage({ _id: 'ie2', type: 'zzz' })
                let mErr2 = await inbox.wait((m) => m._id === 'system' && m.func === 'error' && m.data === 'type error: zzz', 'system error(type error after connect refused)')
                assert.strict.deepEqual(mErr2, { _id: 'system', func: 'error', data: 'type error: zzz' })
                assert.strict.equal(inbox.getCrashed(), null)

            }
            finally {
                await wk.terminate()
            }

        })

    })

}


//取得真實的WebSocket錯誤事件(連至無任何監聽之埠, 以nodejs全域WebSocket), 其為平台物件, 不可structured clone
async function getWsErrorEvent() {
    let port = await getFreePort()
    return new Promise((resolve, reject) => {
        let ws = new WebSocket(`ws://127.0.0.1:${port}`)
        let t = setTimeout(() => {
            reject(new Error('timeout waiting WebSocket error event'))
        }, timeoutWait)
        ws.onerror = (ev) => {
            clearTimeout(t)
            resolve(ev)
        }
    })
}


//載入src/webworker.mjs(直接提供之classic script, 未壓縮)於vm沙箱, 以假的WConverwsClient驅動事件, 並以MessageChannel模擬postMessage(不可複製者同瀏覽器與worker_threads拋DataCloneError)
//不用全域structuredClone模擬: nodejs之structuredClone會把Event複製成空物件而不拋錯, 與真實postMessage(拋DataCloneError)不同
function loadWorkerSrc() {

    //posted: 成功送出(已structured clone)之訊息
    let posted = []

    //channel
    let { port1, port2 } = new MessageChannel()

    //ee: 假的WConverwsClient實例, 測試以ee.emit驅動wo.on(...)之監聽
    let ee = new EventEmitter()
    ee.output = null //execute之結果
    ee.execute = function(func, input, cbProg) {
        cbProg(50)
        ee.pm = Promise.resolve(ee.output)
        return ee.pm
    }
    ee.broadcast = function(input, cbProg) {
        cbProg(100)
    }
    ee.deliver = function(input, cbProg) {
        cbProg(100)
    }

    let sandbox = {
        setInterval: () => 0, //init之偵測計時器不實際排程, 避免殘留計時器
        clearInterval: () => {},
        structuredClone,
        Event,
        WConverwsClient: function() {
            return ee
        },
    }
    sandbox.self = sandbox
    sandbox.postMessage = (m) => {
        port1.postMessage(m) //不可複製者於此拋DataCloneError
        posted.push(receiveMessageOnPort(port2).message)
    }
    vm.createContext(sandbox)
    vm.runInContext(fs.readFileSync(path.resolve('src/webworker.mjs'), 'utf8'), sandbox, { filename: 'src/webworker.mjs' })

    //init, 使wo.on(...)之監聽就緒
    sandbox.onmessage({ data: { type: 'init', _id: 'i1', input: {} } })

    return { sandbox, ee, posted }
}


describe('unit-mergeWorker: src/webworker.mjs送回呼叫端之資料須可structured clone', function() {

    //對應: src/webworker.mjs之sendMessage: 正常路徑原樣postMessage; 拋DataCloneError時改送toCloneable之摘要; 仍送不出時不外拋(不使worker崩潰)

    //evWs: 真實的WebSocket錯誤事件(平台物件), 作為「不可複製」之觸發值
    let evWs = null

    before(async function() {
        evWs = await getWsErrorEvent()
    })

    it('前提: 真實WebSocket錯誤事件確實不可structured clone(同瀏覽器之平台物件)', function() {
        assert.throws(() => {
            new MessageChannel().port1.postMessage({ err: evWs })
        }, { name: 'DataCloneError' })
    })

    it('error事件: WebSocket錯誤事件(Event)改為其type字串, msg保留, 不拋錯', function() {
        let { ee, posted } = loadWorkerSrc()
        assert.doesNotThrow(() => {
            ee.emit('error', { msg: 'websocket error', err: evWs })
        })
        assert.strict.deepEqual(posted, [{ _id: 'system', func: 'error', data: { msg: 'websocket error', err: 'error' } }])
    })

    it('error事件: 不可複製之值(Event、Error、函數、Symbol)改為字串摘要, 可複製之欄位(字串、數字、null、陣列、巢狀物件)保留', function() {
        let { sandbox, ee, posted } = loadWorkerSrc()
        let errSandbox = vm.runInContext('new RangeError("r")', sandbox) //與被測碼同realm, instanceof Error才成立
        ee.emit('error', {
            msg: 'websocket error',
            err: {
                ok: 1,
                s: '中文',
                n: null,
                list: [1, 'a', { b: null }, new Event('x')],
                nest: { msg: 'can not find _mode in data', err: { k: [true, false] } },
                fn: function foo() {},
                sym: Symbol('s'),
                ev: evWs,
                e: errSandbox,
            },
        })
        assert.strict.deepEqual(posted, [{
            _id: 'system',
            func: 'error',
            data: {
                msg: 'websocket error',
                err: {
                    ok: 1,
                    s: '中文',
                    n: null,
                    list: [1, 'a', { b: null }, 'x'],
                    nest: { msg: 'can not find _mode in data', err: { k: [true, false] } },
                    fn: '[Function]',
                    sym: 'Symbol(s)',
                    ev: 'error',
                    e: 'r',
                },
            },
        }])
    })

    it('error事件: 循環參照以10層為限截斷為字串, 淺層欄位保留, 不使worker崩潰', function() {
        let { ee, posted } = loadWorkerSrc()
        let a = { n: 1, f: function() {} }
        a.self = a
        assert.doesNotThrow(() => {
            ee.emit('error', { msg: 'm', err: a })
        })
        assert.strict.equal(posted.length, 1)
        let r = posted[0].data.err
        assert.strict.equal(r.n, 1)
        assert.strict.equal(r.f, '[Function]')
        let depth = 0
        while (r && typeof r === 'object') {
            r = r.self
            depth++
        }
        assert.strict.equal(r, '[object Object]')
        assert.strict.equal(depth >= 5 && depth <= 12, true)
    })

    it('error事件: 資料含"__proto__"自有鍵(JSON.parse可產生)時, 該鍵與值保留為一般欄位而非被當成設定原型', function() {
        let { ee, posted } = loadWorkerSrc()
        let err = JSON.parse('{"__proto__":{"x":1},"y":2}')
        err.ev = evWs
        ee.emit('error', { msg: 'm', err })
        let r = posted[0].data.err
        assert.strict.deepEqual(Object.keys(r), ['__proto__', 'y', 'ev'])
        assert.strict.deepEqual(Object.getOwnPropertyDescriptor(r, '__proto__').value, { x: 1 })
        assert.strict.equal(r.y, 2)
        assert.strict.equal(r.ev, 'error')
    })

    it('正常路徑不轉換: 可複製之資料(含Date、Map、Error)原樣送出', function() {
        let { ee, posted } = loadWorkerSrc()
        let data = { d: new Date(0), m: new Map([[1, 'v']]), a: [1, { b: null }], s: '中文' }
        ee.emit('broadcast', data)
        ee.emit('deliver', data)
        ee.emit('error', { msg: 'can not create websocket', err: new Error('boom') })
        assert.strict.equal(posted.length, 3)
        assert.strict.deepEqual(posted[0], { _id: 'system', func: 'broadcast', data })
        assert.strict.deepEqual(posted[1], { _id: 'system', func: 'deliver', data })

        //Error可複製, 故不轉為字串(不在每則訊息上做轉換)
        assert.strict.equal(posted[2].data.msg, 'can not create websocket')
        assert.strict.equal(posted[2].data.err instanceof Error, true)
        assert.strict.equal(posted[2].data.err.message, 'boom')
    })

    it('broadcast/deliver事件: 資料含不可複製之值時, 保留可複製欄位並以字串摘要取代, 不拋錯', function() {
        let { ee, posted } = loadWorkerSrc()
        let data = { a: 1, f: function g() {}, ev: new Event('open') }
        assert.doesNotThrow(() => {
            ee.emit('broadcast', data)
            ee.emit('deliver', data)
        })
        let expected = { a: 1, f: '[Function]', ev: 'open' }
        assert.strict.deepEqual(posted, [
            { _id: 'system', func: 'broadcast', data: expected },
            { _id: 'system', func: 'deliver', data: expected },
        ])
    })

    it('execute: 進度照送; 結果含不可複製之值時保留可複製欄位並以字串摘要取代', async function() {
        let { sandbox, ee, posted } = loadWorkerSrc()
        ee.output = { r: 3, f: function h() {} }
        sandbox.onmessage({ data: { type: 'execute', _id: 'e1', func: 'add', input: { p1: 1, p2: 2 } } })
        await ee.pm
        assert.strict.deepEqual(posted, [
            { _id: 'e1', prog: 50 },
            { _id: 'e1', output: { r: 3, f: '[Function]' } },
        ])
    })

    it('broadcast/deliver請求之進度與未知type之error字串訊息: 與既有行為相同(R6)', function() {
        let { sandbox, posted } = loadWorkerSrc()
        sandbox.onmessage({ data: { type: 'broadcast', _id: 'b1', input: 'hi' } })
        sandbox.onmessage({ data: { type: 'deliver', _id: 'd1', input: 'hi' } })
        sandbox.onmessage({ data: { type: 'zzz', _id: 'x1' } })
        assert.strict.deepEqual(posted, [
            { _id: 'b1', prog: 100 },
            { _id: 'd1', prog: 100 },
            { _id: 'system', func: 'error', data: 'type error: zzz' },
        ])
    })

    it('送不出時不外拋(不使worker崩潰): postMessage本身失敗(如通道已關閉), 或資料無法轉為摘要(屬性讀取拋錯)', function() {

        //postMessage本身失敗
        let { sandbox, ee, posted } = loadWorkerSrc()
        let post = sandbox.postMessage
        sandbox.postMessage = () => {
            throw new Error('port closed')
        }
        assert.doesNotThrow(() => {
            ee.emit('error', { msg: 'm', err: evWs })
            ee.emit('broadcast', 'x')
            ee.emit('open')
        })
        assert.strict.equal(posted.length, 0)

        //屬性讀取拋錯, 轉摘要時亦失敗
        sandbox.postMessage = post
        let bad = { f: function() {} }
        Object.defineProperty(bad, 'x', {
            enumerable: true,
            get() {
                throw new Error('no read')
            },
        })
        assert.doesNotThrow(() => {
            ee.emit('error', { msg: 'm', err: bad })
        })
        assert.strict.equal(posted.length, 0)

        //之後的訊息仍可送出
        ee.emit('broadcast', 'y')
        assert.strict.deepEqual(posted, [{ _id: 'system', func: 'broadcast', data: 'y' }])

    })

})


describe('unit-mergeWorker', function() {

    after(function() {
        fs.rmSync(fdTmp, { recursive: true, force: true })
        try {
            fs.rmdirSync(path.dirname(fdTmp)) //上層test/_tmp若已無其他案之資料夾則一併移除, 非空會失敗而忽略
        }
        catch (err) {
            //ignore
        }
    })

    it('建置腳本toolg/gMergeWorker.mjs不依賴babel', function() {

        //對應: 本輪需求1(不再import @babel/core, 不依賴由w-package-tools提升而來之套件, babel-preset-minify移除)
        let code = fs.readFileSync(fpBuildScript, 'utf8')
        assert.strict.equal(/@babel|babel-preset|babel-plugin|core-js/.test(code), false)

        let pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'))
        let deps = { ...pkg.dependencies, ...pkg.devDependencies }
        assert.strict.equal(Object.keys(deps).some((k) => k.startsWith('babel-') || k.startsWith('@babel/')), false)

        //建置腳本import之第三方套件須於package.json自行宣告
        let imports = [...code.matchAll(/^import\s+(?:[^'"]*?from\s+)?['"]([^'"]+)['"]/gm)].map((m) => m[1])
        for (let name of imports) {
            if (name === 'fs' || name.startsWith('node:')) {
                continue
            }
            let pkgName = name.startsWith('@') ? name.split('/').slice(0, 2).join('/') : name.split('/')[0]
            assert.strict.equal(Object.prototype.hasOwnProperty.call(deps, pkgName), true, `[${pkgName}] not declared in package.json`)
        }

    })

    suite('已提交產物(srcTemp)', function() {
        return {
            fpMerge: path.resolve(fnMerge),
            fpB64: path.resolve(fnB64),
        }
    })

    describe('dist內嵌', function() {

        it('dist/umd載入後new出之物件所建立之Worker，其程式碼等於srcTemp合併碼', function() {

            //對應: src/webcaller.mjs:10-14,:17-57(以b642str還原codeB64, 經Blob與URL.createObjectURL建立Worker), toolg/gMergeCaller.mjs(把b64置換進webcaller.mjs), toolg/gDistRollupWorker.mjs(打包為dist)
            //以vm沙箱模擬瀏覽器(Blob、Worker、URL.createObjectURL以假物件擷取傳入之程式碼), 不啟動真實Worker
            let dist = fs.readFileSync(path.resolve(fnDist), 'utf8')
            let merge = fs.readFileSync(path.resolve(fnMerge), 'utf8')

            let blobs = []
            let workers = []
            class FakeBlob {
                constructor(parts) {
                    this.text = parts.join('')
                }
            }
            class FakeWorker {
                constructor(url) {
                    this.url = url
                    this.posted = []
                    workers.push(this)
                }

                postMessage(m) {
                    this.posted.push(m)
                }

                terminate() {}
            }
            let sandbox = {
                Blob: FakeBlob,
                Worker: FakeWorker,
                URL: {
                    createObjectURL(b) {
                        blobs.push(b)
                        return 'blob:fake'
                    },
                },
            }
            sandbox.window = sandbox
            sandbox.self = sandbox
            vm.createContext(sandbox)
            vm.runInContext(dist, sandbox, { filename: 'w-converws-client-webworker.umd.js' })

            let WConverwsClientWebworker = sandbox['w-converws-client-webworker']
            assert.strict.equal(typeof WConverwsClientWebworker, 'function')

            let opt = { url: 'ws://127.0.0.1:1', token: '*' }
            let wo = new WConverwsClientWebworker(opt)
            assert.strict.equal(typeof wo.execute, 'function')
            assert.strict.equal(typeof wo.broadcast, 'function')
            assert.strict.equal(typeof wo.deliver, 'function')
            assert.strict.equal(typeof wo.terminate, 'function')

            //建立Worker所用程式碼等於合併碼
            assert.strict.equal(blobs.length, 1)
            assert.strict.equal(workers.length, 1)
            assert.strict.equal(blobs[0].text, merge)

            //建構時即對worker送出init(src/webcaller.mjs:157-173), 與webworker.mjs:133-139所讀之欄位一致
            assert.strict.equal(workers[0].posted.length, 1)
            assert.strict.equal(workers[0].posted[0].type, 'init')
            assert.strict.deepEqual(workers[0].posted[0].input, opt)
            assert.strict.equal(typeof workers[0].posted[0]._id, 'string')

        })

    })

    suite('現場執行建置腳本之產物(暫存資料夾)', function() {
        return buildMergeInTmp()
    })

})
