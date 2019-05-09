const fs = require('fs')
const path = require('path')
const http = require('http')

const detectPort = require('@fibjs/detect-port')

const Gitor = require('..')

const REPO_TMP = path.resolve(__dirname, './repo_tmp')

exports.ensure_repo_tmp = function () {
    if (fs.exists(REPO_TMP) && fs.stat(REPO_TMP).isDirectory())
        return ;

    try {
        fs.rmdir(REPO_TMP)
    } catch (error) {}

    fs.mkdir(REPO_TMP)
}

exports.test_root = function (rel = './') {
    return path.resolve(__dirname, rel)
}

exports.get_http_server = function (repobase_dir, port = detectPort()) {
    const git_routing = Gitor.handlers.get_routing(repobase_dir)

    const svr = new http.Server(port, git_routing)

    return svr
    // process.nextTick(() => {
    //     console.log(`server started on listening ${svr.socket.localPort}`)
    // })
    // svr.run()
}