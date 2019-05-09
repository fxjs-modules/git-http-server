import http = require('http')
import mq = require('mq')
import fs = require('fs')
import path = require('path')
import querystring = require('querystring')

// // import Gitor = require('../git/Gitor')

const GIT_PREFIX_LEN = 'git-'.length
export function get_handlers (repo_basedir: string) {
    // auto create `repo_basedir` if it doesn't existed.
    const fileHandler = http.fileHandler(repo_basedir)
    
    return {
        git_generic (request: Class_HttpRequest, reponame: string, file_uri: string) {
            if (request.isEnded()) return ;

            const resp = request.response
            const repo_dir = path.resolve(repo_basedir, reponame)

            if (!fs.exists(repo_dir)) {
                resp.statusCode = 404
                resp.body.write('Not Found' as any)
                return 
            }

            fileHandler.invoke(request)
            // const target = path.resolve(repo_dir, file_uri)
            // const stm = fs.openFile(target)
            // resp.body.write(stm.readAll())
        },
        git_inforefs (request: Class_HttpRequest, reponame: string) {
            const resp = request.response
            const repo_dir = path.resolve(repo_basedir, reponame)

            if (!fs.exists(repo_dir)) {
                resp.statusCode = 404
                resp.body.write('Not Found' as any)
                return 
            }
            
            if (request.isEnded()) return ;

            let input_data = null as Fibjs.AnyObject
            try {
                input_data = {
                    ...request.query.toJSON(),
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

            const cmd = service.slice(GIT_PREFIX_LEN)

            resp.addHeader({
                'Content-Type': `application/x-${cmd}-advertisement`
            })

            resp.body.rewind()
            
            // deal with error
            const sp = process.open(
                "git",
                [
                    cmd,
                    "--stateless-rpc",
                    "--advertise-refs",
                    repo_dir
                ]
            )

            // const serverAdvert = `# service=${service}\n`
            // const line_len = serverAdvert.length + 4
            
            const serverAdvert = `# service=${service}`
            const line_len = serverAdvert.length + 4 + 1
            const head_mark = line_len.toString(16).padStart(4, '0')
            sp.wait()

            const head = `${head_mark}${serverAdvert}0000`
            resp.body.write(head as any)

            let slice = null
            while (slice = sp.stdout.readLine()) {
                resp.body.write(slice as any)
                // resp.body.write('\n')
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
            request.response.end()
            return 
        }
    }
}

function logger (marks: string = '*') {
    return function (request: Class_HttpRequest) {
        function logit(...args: any[]) {
            console.log(`[${marks}]`, ...args)
        }

        logit('request.method', request.method)
        logit('request.address', request.address)
        logit('request.query.toJSON()', request.query.toJSON())
        logit('request.params', request.params)
        // logit('request.headers.toJSON()', request.headers.toJSON())
        // logit('request.form.toJSON()', request.form.toJSON())
        // logit('request.body.readAll()', request.body.readAll())
        console.log('------')
    }
}

export function get_routing (repo_basedir: string) {
    const handlers = get_handlers(repo_basedir);
    const routing = new mq.Routing({
        // just for learn and deal
        "/:reponame/info/refs": [
            logger('inforefs'), filter_method(['head', 'get']), handlers.git_inforefs
        ],
        // "/([^\/]+)\/?(.*)?": [
        // "/:reponame/*": [
        "/:reponame(.*)?": [
            logger('repofiles'), filter_method(['head', 'get']), handlers.git_generic
        ],
        '*': [
            logger('*')
        ]
    });

    return routing
}
