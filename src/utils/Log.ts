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
        let ser = this._server;
        if (ser) {
            ser.alert(msg);
        }
    }
}

export = Log;