import WebServer from "./WebServer";
import WebSocket from "ws";
import SvnUtil from "./utils/SvnUtil";
import Log = require("./utils/Log");
import { BuildOption, BuildUtil } from "./utils/BuildUtil";

var _inprocess: boolean;

main();

function main() {
    let ser = new WebServer();
    ser.start({ port: 8787 });
    ser.onMessage = onMessage;
    Log.init(ser);
}

async function onMessage(msg: { type: string, data: WebSocket.Data, target: WebSocket }) {
    if (_inprocess) {
        let client = msg.target;
        if (client) {
            client.send("alert:发版程序运行中，请稍后重试");
        }
        return;
    }
    let str = msg.data as string;
    let obj = JSON.parse(str) as BuildOption;
    _inprocess = true;
    let code = await SvnUtil.checkOut(obj.project);
    if (code != 0) {
        return;
    }
    await BuildUtil.build(obj);
    _inprocess = false;
}