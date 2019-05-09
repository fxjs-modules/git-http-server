declare namespace Gitor {
    interface Operator {
        $opts: OperatorOptions
        init: {
            (argvs?: string[]): void;
        }
        remote: {
            // equivalent to `remote(['--all'])`
            (argvs?: string[]): void;
        }
    }

    interface OperatorOptions {
        repo_dir: string
    }
    
    interface Client extends Operator {
        $opts: ClientOptions

        // $remotes: ClientRemoteInfo[]
        
        // clone: {
        //     (argvs?: string[]): void;
        // }
        checkout: {
            (argvs?: string[]): void;
        }
        add: {
            (argvs?: string[]): void;
        }
        rm: {
            (argvs?: string[]): void;
        }
        commit: {
            (argvs?: string[]): void;
        }
        push: {
            (argvs?: string[]): void;
        }
        pull: {
            (argvs?: string[]): void;
        }
        fetch: {
            (argvs?: string[]): void;
        }
        branch: {
            (argvs?: string[]): void;
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
