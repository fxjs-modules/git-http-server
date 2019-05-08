import http = require('http')
import mq = require('mq')
import fs = require('fs')
import path = require('path')

export function get_handlers (repodir: string) {
    // auto resolve project directory with .git.
    if (!repodir.endsWith('.git') && fs.exists(path.resolve(repodir, '.git')))
        repodir = path.resolve(repodir, '.git')

    const fileHandler = http.fileHandler(repodir)
    
    return {
        git_generic (request: Class_HttpRequest, reponame: string) {
            const method = request.method.toLocaleLowerCase()
            if (method !== 'head' && method !== 'get') {
                return
            }

            fileHandler.invoke(request)
        },
        git_branch (request: Class_HttpRequest, branchname: string) {
        },
        
    }
}

export function get_routing (repodir: string) {
    const handlers = get_handlers(repodir);
    const routing = new mq.Routing({
        "/:reponame(.*)?": handlers.git_generic,
        // branch based file explorer
        "tree/:branchname": handlers.git_branch,
    });

    return routing
}