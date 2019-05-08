import fs = require('fs')
import path = require('path')
const mkdirp = require('@fibjs/mkdirp')

export function ensure_repo_dir_exists (repo_dir: string) {
    const e = fs.exists(repo_dir)
    if (e && fs.stat(repo_dir).isDirectory())
        return ;

    if (e)
        throw `target directory ${repo_dir} existed and not directory!`
        
    mkdirp(repo_dir)
}

export function repo_fs_exists (gitor: Gitor.Client, rel: string) {
    const _p = path.resolve(gitor.$opts.repo_dir, rel)

    return fs.exists(_p)
}