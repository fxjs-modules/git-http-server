import path = require('path')

export function normalizeSpreadStyleArgs (args: Gitor.GitOperationArgs): string[] {
    if (Array.isArray(args[0])) {
        return args[0]
    }

    return args as string[]
}

export function on_command_exec (repo_dir: string, sync_callback: Function, self: any = null) {
    const old_cwd = process.cwd();

    process.chdir(repo_dir)

    if (self)
        sync_callback.call(self)
    else
        sync_callback()

    if (process.cwd() !== old_cwd)
        process.chdir(old_cwd)
}

export function auto_resolve_dotgit (repodir: string) {
    // auto resolve project directory with .git.
    // if (!repodir.endsWith('.git') && fs.exists(path.resolve(repodir, '.git')))
    //     repodir = path.resolve(repodir, '.git')

    return repodir
}
