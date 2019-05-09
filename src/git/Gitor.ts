import io = require('io')
import fs = require('fs')

import * as Utils from "./client-utils";
import { on_command_exec } from './_utils';

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
    rm (argv: string[] = []) {
        on_command_exec(this._opts.repo_dir, () => {
            const sp = process.open('git', ['rm', ...argv])
            sp.wait()
        })
    }

    /**
     * @override
     **/
    show (argv: string[] = []): Class_BufferedStream {
        let buf: Class_BufferedStream
        on_command_exec(this._opts.repo_dir, () => {
            const sp = process.open('git', ['show', ...argv])
            buf = new io.BufferedStream(sp.stdout)
            // sp.wait()
        })

        return buf
    }

    /**
     * @override
     **/
    commit (argv: string[] = []) {
        on_command_exec(this._opts.repo_dir, () => {
            const sp = process.open('git', ['commit', ...argv])
            sp.wait()
        })
    }

    /**
     * @override
     **/
    push (argv: string[] = []) {
        on_command_exec(this._opts.repo_dir, () => {
            const sp = process.open('git', ['push', ...argv])
            sp.wait()
        })
    }

    /**
     * @override
     **/
    pull (argv: string[] = []) {
        on_command_exec(this._opts.repo_dir, () => {
            const sp = process.open('git', ['pull', ...argv])
            sp.wait()
        })
    }

    /**
     * @override
     **/
    fetch (argv: string[] = []) {
        on_command_exec(this._opts.repo_dir, () => {
            const sp = process.open('git', ['fetch', ...argv])
            sp.wait()
        })
    }
}

export = Gitor
