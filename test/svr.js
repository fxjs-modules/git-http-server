const helpers = require('./spec_helpers')

const svr = helpers.get_http_server(helpers.test_root('./repo_tmp/remote/'), 8090)

process.nextTick(() => {
    console.log(`server started on listening ${svr.socket.localPort}`)
})
svr.run()