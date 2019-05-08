const semver = require('semver')

const GITOR_EXP = /^git version (\d+\.\d+\.\d+) \(.+\)/

function compute_git_version_from_raw_string (input) {
    const exec_result = GITOR_EXP.exec(input)
    return exec_result[1]
}

exports.git = function (should_throw = false) {
    let payload = {
        result: {
           version: null,
        },
        error: null
    }
    
    try {
        const subp = process.open('git', ['--version'])
        subp.wait()
        payload.result.version = compute_git_version_from_raw_string(
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

exports.npm = function (should_throw = false) {
    let payload = {
        result: {
           version: null,
        },
        error: null
    }
    
    try {
        const subp = process.open('npm', ['--version'])
        subp.wait()
        const sem = subp.readLine()
        payload.result.version = semver(sem).raw
    } catch (error) {
        payload.result.version = null
        payload.result.error = error

        console.error(`no required npm installed`)

        if (should_throw)
            throw error
    }

    return payload
}