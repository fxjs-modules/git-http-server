import io = require('io')
import fs = require('fs')

import * as Utils from "./client-utils";
import { on_command_exec, normalizeSpreadStyleArgs } from './_utils';

import * as handlers from '../utils/handlers';
import * as checkor from '../utils/checkor';

class Gitor implements Gitor.Client {
    static default = Gitor
    static Utils = Utils;

    static handlers = handlers;
    static checkor = checkor;

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
    init (...argvs: Gitor.GitOperationArgs) {
        const args = normalizeSpreadStyleArgs(argvs)
        on_command_exec(this._opts.repo_dir, () => {
            const sp = process.open('git', ['init', ...args])
            sp.wait()
        })
    }
    
    /**
     * @override
     **/
    checkout (...argvs: Gitor.GitOperationArgs) {
        const args = normalizeSpreadStyleArgs(argvs)
        on_command_exec(this._opts.repo_dir, () => {
            const sp = process.open('git', ['checkout', ...args])
            sp.wait()
        })
    }
    
    /**
     * @override
     **/
    add (...argvs: Gitor.GitOperationArgs) {
        const args = normalizeSpreadStyleArgs(argvs)
        on_command_exec(this._opts.repo_dir, () => {
            const sp = process.open('git', ['add', ...args])
            sp.wait()
        })
    }
    
    /**
     * @override
     **/
    remote (...argvs: Gitor.GitOperationArgs) {
        const args = normalizeSpreadStyleArgs(argvs)
        on_command_exec(this._opts.repo_dir, () => {
            const sp = process.open('git', ['remote', ...args])
            sp.wait()
        })
    }

    /**
     * @override
     **/
    rm (...argvs: Gitor.GitOperationArgs) {
        const args = normalizeSpreadStyleArgs(argvs)
        on_command_exec(this._opts.repo_dir, () => {
            const sp = process.open('git', ['rm', ...args])
            sp.wait()
        })
    }

    /**
     * @override
     **/
    show (...argvs: Gitor.GitOperationArgs): Class_BufferedStream {
        let buf: Class_BufferedStream
        const args = normalizeSpreadStyleArgs(argvs)
        on_command_exec(this._opts.repo_dir, () => {
            const sp = process.open('git', ['show', ...args])
            buf = new io.BufferedStream(sp.stdout)
            // sp.wait()
        })

        return buf
    }

    /**
     * @override
     **/
    commit (...argvs: Gitor.GitOperationArgs) {
        const args = normalizeSpreadStyleArgs(argvs)
        on_command_exec(this._opts.repo_dir, () => {
            const sp = process.open('git', ['commit', ...args])
            sp.wait()
        })
    }

    /**
     * @override
     **/
    push (...argvs: Gitor.GitOperationArgs) {
        const args = normalizeSpreadStyleArgs(argvs)
        on_command_exec(this._opts.repo_dir, () => {
            const sp = process.open('git', ['push', ...args])
            sp.wait()
        })
    }

    /**
     * @override
     **/
    pull (...argvs: Gitor.GitOperationArgs) {
        const args = normalizeSpreadStyleArgs(argvs)
        on_command_exec(this._opts.repo_dir, () => {
            const sp = process.open('git', ['pull', ...args])
            sp.wait()
        })
    }

    /**
     * @override
     **/
    fetch (...argvs: Gitor.GitOperationArgs) {
        const args = normalizeSpreadStyleArgs(argvs)
        on_command_exec(this._opts.repo_dir, () => {
            const sp = process.open('git', ['fetch', ...args])
            sp.wait()
        })
    }

    /**
     * @override
     **/
    branch (...argvs: Gitor.GitOperationArgs) {
        const args = normalizeSpreadStyleArgs(argvs)
        on_command_exec(this._opts.repo_dir, () => {
            const sp = process.open('git', ['branch', ...args])
            sp.wait()
        })
    }
}

export = Gitor
