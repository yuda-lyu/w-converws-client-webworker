import WConverwsServer from 'w-converws/dist/w-converws-server.umd.js'

let opt = {
    port: 8080,
}

//new
let wo = new WConverwsServer(opt)

wo.on('open', function() {
    //console.log(`Server[port:${opt.port}]: open`)
    console.log(`Server running at: ws://localhost:${opt.port}`)

    //broadcast
    let n = 0
    setInterval(() => {
        n += 1
        let o = {
            text: `server broadcast hi(${n})`,
            data: new Uint8Array([66, 97, 115]), //support Uint8Array data
        }
        wo.broadcast(o, function (prog) {
            console.log('broadcast prog', prog)
        })
    }, 1000)

})
wo.on('error', function(err) {
    console.log(`Server[port:${opt.port}]: error`, err)
})
wo.on('clientChange', function(clients) {
    console.log(`Server[port:${opt.port}]: now clients: ${clients.length}`)
})
wo.on('execute', function(func, input, callback) {
    console.log(`Server[port:${opt.port}]: execute`, func, input)

    if (func === 'add') {
        let r = input.p1 + input.p2
        callback(r)
    }

})
wo.on('broadcast', function(data) {
    console.log(`Server[port:${opt.port}]: broadcast`, data)
})
wo.on('deliver', function(data) {
    console.log(`Server[port:${opt.port}]: deliver`, data)
})
