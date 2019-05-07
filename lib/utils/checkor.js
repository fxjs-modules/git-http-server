// const semver = require('semver')

const GITOR_EXP = /^git version (\d+\.\d+\.\d+) \(.+\)/

function compute_git_version_from_raw_string (input) {
    const exec_result = GITOR_EXP.exec(input)
    return exec_result[1]
}

exports.git_checkor = function (should_throw = false) {
    let payload = {
        result: {
           version: null,
        },
        error: null
    }
    
    try {
        const subp = process.open('git', ['--version'])
        const v = payload.result.version = compute_git_version_from_raw_string(
            subp.readLine()
        )
    } catch (error) {
        payload.result.version = null
        payload.result.error = error

        console.error(`no required git installed`)

        if (should_throw)
            throw error
    }

    return payload
}