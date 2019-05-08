import fs = require('fs')

import * as Utils from "./client-utils";
import { on_command_exec } from './_utils';

class GitClient implements Gitor.Client {
    static default = GitClient
    static Utils = Utils;

    mode: Gitor.Client['mode']

    
    constructor (
        private _opts: Gitor.ClientConstructorOptions = {
            repo_dir: null,
            remotes: []
        }
    ) {
        this._opts = _opts
        Utils.ensure_repo_dir_exists(_opts.repo_dir)
    }

    get $opts () {
        return this._opts
    }

    private get $status () {
        return {
            repo_dir_existed: fs.exists(this._opts.repo_dir)
        }
    }
    
    /**
     * @override
     **/
    init (argv: string[] = []) {
        on_command_exec(this._opts.repo_dir, () => {
            const sp = process.open('git', ['init', ...argv])
            sp.wait()
        })
    }
    
    /**
     * @override
     **/
    add (argv: string[] = []) {
        on_command_exec(this._opts.repo_dir, () => {
            const sp = process.open('git', ['add', ...argv])
            sp.wait()
        })
    }
    
    /**
     * @override
     **/
    remote (argv: string[] = []) {
        on_command_exec(this._opts.repo_dir, () => {
            const sp = process.open('git', ['remote', ...argv])
            sp.wait()
        })
    }

    /**
     * @override
     **/
    rm () {
        on_command_exec(this._opts.repo_dir, () => {
            const sp = process.open('git', ['rm'])
            sp.wait()
        })
    }

    /**
     * @override
     **/
    show () {
        on_command_exec(this._opts.repo_dir, () => {
            const sp = process.open('git', ['show'])
            sp.wait()
        })
    }

    /**
     * @override
     **/
    commit () {
        on_command_exec(this._opts.repo_dir, () => {
            const sp = process.open('git', ['commit'])
            sp.wait()
        })
    }

    /**
     * @override
     **/
    fetch () {
        on_command_exec(this._opts.repo_dir, () => {
            const sp = process.open('git', ['fetch'])
            sp.wait()
        })
    }
}

export = GitClient