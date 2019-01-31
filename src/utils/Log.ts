import WebServer = require("../WebServer");

class Log {

    private static _server: WebServer;
    public static init(ser: WebServer) {
        this._server = ser;
    }
    public static out(msg: string) {

        let ser = this._server;
        if (ser) {
            ser.broadCast(msg);
        }
        console.log(msg);
    }

    public static alert(msg: string) {
        msg = "alert:" + msg;
        this.out(msg);
    }

    public static progress(msg: string) {
        msg = "progress:" + msg;
        this.out(msg);
    }

    public static progressEnd(msg: string) {
        msg = "progressEnd:" + msg;
        this.out(msg);
    }
}

export = Log;