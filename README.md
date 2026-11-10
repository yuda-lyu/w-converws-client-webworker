# w-converws-client-webworker
A webworker wrapper for client of w-converws in browser. It is an enhanced package of w-converws-client.

![language](https://img.shields.io/badge/language-JavaScript-orange.svg) 
[![npm version](http://img.shields.io/npm/v/w-converws-client-webworker.svg?style=flat)](https://npmjs.org/package/w-converws-client-webworker) 
[![license](https://img.shields.io/npm/l/w-converws-client-webworker.svg?style=flat)](https://npmjs.org/package/w-converws-client-webworker) 
[![npm download](https://img.shields.io/npm/dt/w-converws-client-webworker.svg)](https://npmjs.org/package/w-converws-client-webworker) 
[![npm download](https://img.shields.io/npm/dm/w-converws-client-webworker.svg)](https://npmjs.org/package/w-converws-client-webworker) 
[![jsdelivr download](https://img.shields.io/jsdelivr/npm/hm/w-converws-client-webworker.svg)](https://www.jsdelivr.com/package/npm/w-converws-client-webworker)

## Documentation
To view documentation or get support, visit [docs](https://yuda-lyu.github.io/w-converws-client-webworker/WConverwsClientWebworker.html).

## Installation

### In a browser(UMD module):

Add script for w-converws-client-webworker.
```alias
<script src="https://yuda-lyu.github.io/w-converws-client-webworker/dist/w-converws-client-webworker.umd.js"></script>
```

#### Example for w-converws-server:
Use `w-converws-server` of [`w-converws`](https://github.com/yuda-lyu/w-converws) to build WebSocket Server.
> **Link:** [[dev source code](https://github.com/yuda-lyu/w-converws-client-webworker/blob/master/srv.mjs)]

#### Example for w-converws-client-webworker:
> **Link:** [[dev source code](https://github.com/yuda-lyu/w-converws-client-webworker/blob/master/web.html)]

```alias
let opt = {
    url: 'ws://localhost:8080',
    token: '*',
}

//new
let WConverwsClient=window['w-converws-client-webworker']
let wo = new WConverwsClient(opt)

wo.on('open', function() {
    console.log('client web: open')
})
wo.on('openOnce', function() {
    console.log('client web: openOnce')

    //execute
    wo.execute('add', { p1: 1, p2: 2 },
        function (prog) {
            console.log('client web: execute prog=', prog)
        })
        .then(function(r) {
            console.log('client web: execute: add=', r)
        })

    //broadcast
    wo.broadcast('client web: broadcast: hi', function (prog) {
        console.log('client web: broadcast prog=', prog)
    })

    //deliver
    wo.deliver('client web: deliver: hi', function (prog) {
        console.log('client web: deliver prog=', prog)
    })

})
wo.on('close', function() {
    console.log('client web: close')
})
wo.on('error', function(err) {
    console.log('client web: error=', err)
})
wo.on('reconn', function() {
    console.log('client web: reconn')
})
wo.on('broadcast', function(data) {
    console.log('client web: broadcast=', data)
})
// wo.on('deliver', function(data) { //can not receive deliver in client
//     console.log('client web: deliver=', data)
// })

// client web: open
// client web: openOnce
// client web: execute prog=100
// client web: broadcast prog=100
// client web: deliver prog=100
// client web: execute: add=3
```

#### Data of the `error` event:
The data has the same shape as `w-converws-client` (the version not running in a Web Worker), `{ msg: String, err: * }`, for example `{ msg: 'websocket error', err: 'error' }` when the server cannot be reached. The difference is that data must be passed from the Web Worker to the caller via `postMessage` (structured clone), and values that cannot be cloned (such as the `Event` object of a WebSocket error) would make `postMessage` throw `DataCloneError`. So the Web Worker sends the data as is, and only when `DataCloneError` is thrown, sends a cloneable summary instead, in which `err` is a summary instead of the original object:

| Value in the Web Worker | Value received by the caller |
| --- | --- |
| string, number, `null`, array, plain object | kept |
| `Event` (such as the WebSocket error event) | its `type` string, usually `'error'` |
| `Error` | its `message` string |
| function | `'[Function]'` |
| other values that cannot be cloned, or nesting deeper than 10 levels | `String(value)` |

Data that can be cloned (a string, JSON data, or an `Error` in browsers that can clone it) is not converted and is passed as is. Therefore the original `Event` object (with `target`) is not available to the caller. If even the summary cannot be sent (for example the channel is closed), the message is dropped and the worker does not crash. When the worker receives a message of an unknown `type`, the data of `error` is the string `'type error: <type>'`. Data of `broadcast`, `deliver` and the result of `execute` comes from JSON of the server, so it is cloneable and passed as is.