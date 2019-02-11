import WebServer = require("../WebServer");

export class Log {

    private static _server: WebServer;
    public static init(ser: WebServer) {
        this._server = ser;
    }
    public static out(msg: string) {

        let out = {} as LogMessage;
        out.type = LogType.Normal;
        out.value = msg;

        this.broadCast(out);
    }

    public static alert(msg: string) {
        let out = {} as LogMessage;
        out.type = LogType.Alert;
        out.value = msg;
        this.broadCast(out);
    }

    public static progress(msg: string) {
        let out = {} as LogMessage;
        out.type = LogType.Progress;
        out.value = msg;
        this.broadCast(out);
    }

    public static progressEnd(msg: string) {
        let out = {} as LogMessage;
        out.type = LogType.ProgressEnd;
        out.value = msg;
        this.broadCast(out);
    }

    private static broadCast(msg: LogMessage) {
        let ser = this._server;
        if (ser) {
            ser.broadCast(msg);
        }
        console.log(msg.value);
    }
}

export interface LogMessage {
    type: LogType,
    value: string,
}

export const enum LogType {
    Normal = "normal",
    Alert = "alert",

    Progress = "progress",

    ProgressEnd = "progressEnd"
}