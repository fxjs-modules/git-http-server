import http = require('http')
import mq = require('mq')
import fs = require('fs')
import path = require('path')
import querystring = require('querystring')

const GIT_PREFIX_LEN = 'git-'.length
const LF = '\n'
/**
 * @see https://github.com/git/git/blob/master/Documentation/technical/http-protocol.txt
 * 
 * @param repo_basedir 
 */
export function get_handlers (repo_basedir: string) {
    // auto create `repo_basedir` if it doesn't existed.
    const fileHandler = http.fileHandler(repo_basedir)
    
    return {
        git_generic (request: Class_HttpRequest, reponame: string, file_uri: string) {
            if (request.response.isEnded()) return ;

            fileHandler.invoke(request)
        },
        git_inforefs (request: Class_HttpRequest, reponame: string) {
            const resp = request.response
            const repo_dir = path.resolve(repo_basedir, reponame)
            
            if (resp.isEnded()) return ;

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

            resp.addHeader({
                'Content-Type': `application/x-${service}-advertisement`,
                'Cache-Control': `no-cache`
            })

            resp.body.rewind()
            
            const command = service.slice(GIT_PREFIX_LEN)
            // TODO: deal with error
            const sp = process.open(
                "git",
                [
                    command,
                    "--stateless-rpc",
                    "--advertise-refs",
                    repo_dir
                ]
            )

            const serverAdvert = `# service=${service}${LF}`
            const line_len = serverAdvert.length + 4
            
            const head_mark = line_len.toString(16).padStart(4, '0')
            sp.wait()

            const head = `${head_mark}${serverAdvert}0000`
            resp.body.write(head as any)

            let slice = null
            while (slice = sp.stdout.readLine()) {
                resp.body.write(slice as any)
                resp.body.write(LF as any)
            }
            resp.body.truncate(resp.body.size() - 1)
                
            resp.body.rewind()
        },
        git_rpc (request: Class_HttpRequest, reponame: string, command: string) {
            const resp = request.response
            const repo_dir = path.resolve(repo_basedir, reponame)
            
            if (resp.isEnded()) return ;

            if (!command) {
                resp.statusCode = 400
                resp.body.write('Invalid request' as any)
                return 
            }

            resp.addHeader({
                'Content-Type': `application/x-git-${command}-advertisement`,
                'Cache-Control': `no-cache`
            })
            const sp = process.open(
                "git",
                [
                    command,
                    "--stateless-rpc",
                    repo_dir
                ]
            )

            request.body.copyTo(sp, -1/* , () => void 0 */)
            sp.copyTo(request.response.body, -1/* , () => void 0 */)

            sp.wait()

            if (command === 'receive-pack')
                process.start(
                    "git",
                    [
                        "--git-dir",
                        repo_dir,
                        "update-server-info"
                    ]
                ).wait()
        }        
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

function repo_checkor (repo_basedir: string) {
    return function (request: Class_HttpRequest, reponame: string) {
        const resp = request.response
        const repo_dir = path.resolve(repo_basedir, reponame)

        if (!fs.exists(repo_dir)) {
            resp.statusCode = 404
            resp.body.write('Not Found' as any)

            resp.end()
            return 
        }
    }
}

export function get_routing (repo_basedir: string) {
    const handlers = get_handlers(repo_basedir);
    const routing = new mq.Routing({
        "/:reponame/info/refs": [
            filter_method(['head', 'get']),
            // logger('inforefs'),
            repo_checkor(repo_basedir),
            handlers.git_inforefs
        ],
        "/:reponame/git-([^/]+)?": [
            filter_method(['post']),
            // logger('repofiles'),
            repo_checkor(repo_basedir),
            handlers.git_rpc
        ],
        // "/([^\/]+)\/?(.*)?": [
        // "/:reponame/*": [
        "/:reponame(.*)?": [
            filter_method(['head', 'get']),
            // logger('repofiles'),
            repo_checkor(repo_basedir),
            handlers.git_generic
        ],
        '*': [
            logger('*')
        ]
    });

    return routing
}
