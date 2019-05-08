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