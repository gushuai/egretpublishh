"use strict";
class Log {
    static init(ser) {
        this._server = ser;
    }
    static out(msg) {
        let ser = this._server;
        if (ser) {
            ser.broadCast(msg);
        }
        console.log(msg);
    }
    static alert(msg) {
        let ser = this._server;
        if (ser) {
            ser.broadCast(msg);
        }
    }
}
module.exports = Log;
