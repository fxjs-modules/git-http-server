const test = require('test')
test.setup()


describe('utils', () => {
    const CHECKOR = require('../lib/utils/checkor')

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
})

test.run(console.DEBUG)