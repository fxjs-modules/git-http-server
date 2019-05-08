const test = require('test')
test.setup()

const path = require('path')
const http = require('http')
const mq = require('mq')

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

    xdescribe('handlers', () => {
        function faker_http_request(_path) {
            const req = new http.Request()
            req.address = req.value = _path;

            return req
        }

        describe('generic', () => {
            it('info/refs', () => {
                const repodir = path.resolve(__dirname, './repo_tmp/remote')
                const routing = HANDLERS.get_routing(repodir)

                const req = faker_http_request('/test2/info/refs')
                mq.invoke(routing, req)

                assert.exist(req.response.body)

                assert.exist(req.response.body.readAll())
            })

            it('tree/[branch]', () => {

            })
        })
    })
})

test.run(console.DEBUG)