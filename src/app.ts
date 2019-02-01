import WebServer from "./WebServer";
import WebSocket from "ws";
import SvnUtil from "./utils/SvnUtil";
import Log = require("./utils/Log");
import { BuildOption, BuildUtil } from "./utils/BuildUtil";

let _inprocess: boolean;

main();

function main() {
    let g = global as any;
    g._rootDir = "E:/publishtest/";
    g._remoteRootDir = "/webproject";
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
    try {
        let code = await SvnUtil.checkOut(obj.project);
        if (code != 0) {
            _inprocess = false;
            return;
        }
        if (obj.type == "build") {
            await BuildUtil.build(obj);
        } else if (obj.type == "publish") {
            await BuildUtil.publish(obj);
        }
    } catch (err) {
        Log.out(err.message);
    }
    _inprocess = false;
}