const test = require('test')
test.setup()

const fs = require('fs')
const http = require('http')
const path = require('path')
const mq = require('mq')
const url = require('url')
const querystring = require('querystring')

const rmdirr = require('@fibjs/rmdirr')

const helpers = require('./spec_helpers')

helpers.ensure_repo_tmp()

describe('utils', () => {
    const CHECKOR = require('../lib/utils/checkor')
    const HANDLERS = require('../lib/utils/handlers')
    
    const Gitor = require('../lib/git/Gitor')


    describe('checkors', () => {
        it('git', () => {
            const data = CHECKOR.git()

            assert.exist(data.result.version)
            assert.equal(data.error, null)

            console.notice('git version', data.result.version)
        });

        it('npm', () => {
            const data = CHECKOR.npm()

            assert.exist(data.result.version)
            assert.equal(data.error, null)

            console.notice('npm version', data.result.version)
        });
    })

    describe('Gitor', () => {
        let operator
        let client

        const paths = {
            remote: helpers.test_root('./repo_tmp/remote/gitor'),
            client: helpers.test_root('./repo_tmp/client/gitor'),
        }

        function clear () {
            Object.values(paths).forEach(x => rmdirr(x))
        }
        
        beforeEach(() => {            
            operator = new Gitor({ repo_dir: helpers.test_root('./repo_tmp/remote/gitor') })
            client = new Gitor({ repo_dir: helpers.test_root('./repo_tmp/client/gitor') })
            assert.ok( client.$status.repo_dir_existed )
        })
        
        it('repo_dir exists', () => {
            assert.ok( operator.$status.repo_dir_existed )
            assert.ok( client.$status.repo_dir_existed )
        })

        describe('[once] operator/client', () => {
            before(() => {
                clear()
            })

            it('operator: init --bare', () => {
                operator.init(['--bare'])
            })

            it('client: init', () => {
                client.init()
            })

            it('client: remote add origin master', () => {
                client.remote(['add', 'origin', '../remote/gitor'])
                client.remote(['set-url', 'origin', '../remote/gitor'])
                client.remote(['add', 'origin2', '../remote/gitor'])
            })
        })
    })

    describe('handlers', () => {
        let server = null
        let client = null
        const repo_basedir = helpers.test_root('./repo_tmp/remote/')

        const routing = HANDLERS.get_routing(repo_basedir)

        function faker_http_request(_path, method = 'get') {
            const req = new http.Request()
            req.method = method

            const url_obj = url.parse(_path)

            req.address = req.value = url_obj.pathname;
            req.queryString = url_obj.query

            return req
        }

        function clear () {
            rmdirr(helpers.test_root('./repo_tmp/remote/duplex_com'))
            rmdirr(helpers.test_root('./repo_tmp/client/duplex_com'))
        }

        before(() => {
            clear()

            server = new Gitor({ repo_dir: helpers.test_root('./repo_tmp/remote/duplex_com') })
            server.init(['--bare'])
            client = new Gitor({ repo_dir: helpers.test_root('./repo_tmp/client/duplex_com') })
            client.init()
            client.remote(['add', 'origin', server.$opts.repo_dir])
        })

        describe('generic (static file handler)', () => {
            function assert_static_file (
                http_req_path,
                resp_content
            ) {
                const req = faker_http_request(http_req_path)
                mq.invoke(routing, req)

                const resp = req.response

                assert.equal(resp.statusCode, 200)
                assert.exist(resp.body)

                const content = resp.body.readAll()
                assert.exist(content)
                assert.equal(
                    content.compare(Buffer.from(resp_content)),
                    0
                )
            }

            it('HEAD', () => {
                // fresh repo
                assert_static_file('/duplex_com/HEAD', `ref: refs/heads/master\n`)
            })
        })

        describe('inforefs', () => {
            function assert_inforefs (service) {
                const req = faker_http_request(`/duplex_com/info/refs?service=${service}`)
                mq.invoke(routing, req)

                const resp = req.response

                assert.equal(resp.statusCode, 200)
                assert.exist(resp.body)

                assert.equal(resp.firstHeader('Content-type'), `application/x-${service.slice(4)}-advertisement`)

                const content = resp.body.readAll()
                assert.exist(content)

                console.notice(`inforefs response by ${service}\n`, content + '')
            }

            before(() => {
                const files = [
                    {
                        filename: helpers.test_root('./repo_tmp/client/duplex_com/test.js'),
                        filecontent: 'test.js'
                    },
                    {
                        filename: helpers.test_root('./repo_tmp/client/duplex_com/test.ts'),
                        filecontent: 'test.ts'
                    }
                ];

                files.forEach(fileinfo => {
                    fs.writeTextFile(fileinfo.filename, fileinfo.filecontent)
                })
                client.add([`-A`])
                client.commit([`-m"Init."`])
                client.push(['origin', '-u', 'master'])


                files.forEach(fileinfo => {
                    const rel_path = path.relative(client.$opts.repo_dir, fileinfo.filename)
                    const fileContent = client.show([`HEAD:./${rel_path}`]).readLines().join('\n')
                    
                    assert.equal(
                        fileContent,
                        fileinfo.filecontent
                    )
                })
            })
            
            it('git-receive-pack', () => {
                assert_inforefs('git-receive-pack')
            })
            
            it('git-upload-pack', () => {
                assert_inforefs('git-upload-pack')
            })
        })
    })
})

test.run(console.DEBUG)
