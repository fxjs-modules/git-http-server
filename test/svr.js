const http = require('http')

const Gitor = require('..')
const helpers = require('./spec_helpers')

const git_routing = Gitor.handlers.get_routing(
    helpers.test_root('./repo_tmp/remote/')
)

const svr = new http.Server(8090, git_routing)

process.nextTick(() => {
    console.log(`server started on listening ${svr.socket.localPort}`)
})
svr.run()