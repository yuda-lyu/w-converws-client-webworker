# w-converws-client-webworker
A webworker wrapper for client of w-converws in browser. It is an enhanced package of w-converws-client.

![language](https://img.shields.io/badge/language-JavaScript-orange.svg) 
[![npm version](http://img.shields.io/npm/v/w-converws-client-webworker.svg?style=flat)](https://npmjs.org/package/w-converws-client-webworker) 
[![Build Status](https://travis-ci.org/yuda-lyu/w-converws-client-webworker.svg?branch=master)](https://travis-ci.org/yuda-lyu/w-converws-client-webworker) 
[![license](https://img.shields.io/npm/l/w-converws-client-webworker.svg?style=flat)](https://npmjs.org/package/w-converws-client-webworker) 
[![gzip file size](http://img.badgesize.io/yuda-lyu/w-converws-client-webworker/master/dist/w-converws-client-webworker-server.umd.js.svg?compression=gzip)](https://github.com/yuda-lyu/w-converws-client-webworker)
[![npm download](https://img.shields.io/npm/dt/w-converws-client-webworker.svg)](https://npmjs.org/package/w-converws-client-webworker) 
[![jsdelivr download](https://img.shields.io/jsdelivr/npm/hm/w-converws-client-webworker.svg)](https://www.jsdelivr.com/package/npm/w-converws-client-webworker)

## Documentation
To view documentation or get support, visit [docs](https://yuda-lyu.github.io/w-converws-client-webworker/WConverwsClientWebworker.html).

## Installation

### In a browser(UMD module):
> **Note:** `w-converws-client-webworker` does't depend on any package.

[Necessary] Add script for w-converws-client-webworker.
```alias
<script src="https://cdn.jsdelivr.net/npm/w-converws-client-webworker@1.0.19/dist/w-converws-client-webworker.umd.js"></script>
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