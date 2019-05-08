import http = require('http')
import mq = require('mq')
import fs = require('fs')
import path = require('path')
import querystring = require('querystring')

import Gitor = require('../git/Gitor')

const GIT_PREFIX_LEN = 'git-'.length
export function get_handlers (repo_basedir: string) {
    // auto create `repo_basedir` if it doesn't existed.
    const fileHandler = http.fileHandler(repo_basedir)
    
    return {
        git_generic (request: Class_HttpRequest, reponame: string) {
            if (request.isEnded()) return ;
            
            fileHandler.invoke(request)
        },
        git_inforefs (request: Class_HttpRequest, reponame: string) {
            const resp = request.response
            const repo_dir = path.resolve(repo_basedir, reponame)

            if (!fs.exists(repo_dir)) {
                resp.statusCode = 400
                resp.body.write('Not Found' as any)
                return 
            }
            
            if (request.isEnded()) return ;

            let input_data = null as Fibjs.AnyObject
            try {
                input_data = {
                    ...request.query,
                    ...querystring.parse(request.queryString || '').toJSON()
                }
            } catch (error) {
                resp.statusCode = 500
                resp.body.write('Internal Server Error' as any)
                return 
            }
            
            const service = input_data.service

            if (!service) {
                resp.statusCode = 400
                resp.body.write('Invalid request' as any)
                return 
            }

            resp.addHeader({
                'Content-type': `application/x-${service}-advertisement`
            })
            
            // deal with error
            const sp = process.open(
                "git",
                [
                    service.slice(GIT_PREFIX_LEN),
                    "--stateless-rpc",
                    "--advertise-refs",
                    repo_dir
                ]
            )
            const serverAdvert = `# service=${service}`
            const line_len = serverAdvert.length + 4
            const head = `${line_len.toString(16).padStart(4, '0')}${serverAdvert}0000`
            sp.wait()
            
            resp.body.write(head as any)
            let slice = null
            while (slice = sp.stdout.readLine()) {
                resp.body.write(slice as any)
            }
                
            resp.body.rewind()
        },
        git_branch (request: Class_HttpRequest, branch_name: string) {
        },
        
    }
}

function filter_method (method: string | string[] = 'post') {
    const methods = Array.isArray(method) ? method : [method]

    return function (request: Class_HttpRequest) {
        const req_method = (request.method || '').toLowerCase()

        if (!methods.includes(req_method)) {
            // request.end()
            request.response.end()
            return 
        }
    }
}

export function get_routing (repo_basedir: string) {
    const handlers = get_handlers(repo_basedir);
    const routing = new mq.Routing({
        "/:reponame/info/refs": [
            filter_method(['head', 'get']), handlers.git_inforefs
        ],
        "/:reponame(.*)?": [
            filter_method(['head', 'get']), handlers.git_generic
        ],
        // branch based file explorer
        "tree/:branch_name": handlers.git_branch,
    });

    return routing
}
