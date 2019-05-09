declare namespace CtxCheckor {
    interface CheckResult {
        result: {
            version: string
        },
        error: null | Error
    }
}