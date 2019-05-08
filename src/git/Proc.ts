import Gitor from './Gitor'

export default class StdProc extends Gitor implements Gitor.ProcClient {
    _subprocess: Gitor.ProcClient['_subprocess'];

    constructor (
        subproc: Gitor.ProcClient['_subprocess'],
        opts?: Gitor.ClientConstructorOptions
    ) {
        super(opts)

        this._subprocess = subproc;
    }

    add () {
        
    }
}