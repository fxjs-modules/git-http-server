declare namespace Gitor {
    interface Operator {
        $opts: OperatorOptions
        init: {
            (...argvs: GitOperationArgs): void;
        }
        remote: {
            // equivalent to `remote(['--all'])`
            (...argvs: GitOperationArgs): void;
        }
    }

    interface OperatorOptions {
        repo_dir: string
    }

    type GitOperationArgs = [string[]] | string[]
    
    interface Client extends Operator {
        $opts: ClientOptions

        // $remotes: ClientRemoteInfo[]
        
        // clone: {
        //     (argvs?: string[]): void;
        // }
        checkout: {
            (...argvs: GitOperationArgs): void;
        }
        add: {
            (...argvs: GitOperationArgs): void;
        }
        rm: {
            (...argvs: GitOperationArgs): void;
        }
        commit: {
            (...argvs: GitOperationArgs): void;
        }
        push: {
            (...argvs: GitOperationArgs): void;
        }
        pull: {
            (...argvs: GitOperationArgs): void;
        }
        fetch: {
            (...argvs: GitOperationArgs): void;
        }
        branch: {
            (...argvs: GitOperationArgs): void;
        }

        [k: string]: any
    }

    interface ClientOptions extends OperatorOptions {
        remote?: string
        remotes?: {
            name: string
            uri: string
        }[]
        // alias of { remotes: [remote] }
    }

    interface ClientConstructorOptions extends ClientOptions {
    }

    interface StdProc {
        _subprocess: Class_SubProcess;
    }

    interface ProcClient extends StdProc, Client {
        mode: Client['mode']
    }
}
