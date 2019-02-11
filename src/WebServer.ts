import { Server, ServerOptions } from "ws";
import WebSocket from "ws";
import { LogMessage } from "./utils/Log";
class WebServer {
    private _clients: WebSocket[] = [];

    public onMessage: (data: any) => void = undefined as any;

    start(opt: ServerOptions) {
        let server = new Server(opt);
        let _self = this;
        server.on("connection", (client) => {
            _self.onClientConnet(client);
        });
    }

    broadCast(msg: LogMessage) {
        let clients = this._clients;
        if (clients) {
            let len = clients.length;
            for (let i = 0; i < len; i++) {
                let client = clients[i];
                client.send(JSON.stringify(msg));
            }
        }
    }

    private onClientConnet(client: WebSocket) {
        let _self = this;
        _self._clients.push(client);
        client.onmessage = (msg) => {
            _self.onClientMsg(msg);
        }
        client.onclose = (e: { target: WebSocket }) => {
            _self.onClientClose(e.target);
        }
    }

    private onClientClose(client: WebSocket) {
        let inx = this._clients.indexOf(client);
        this._clients.splice(inx);
    }

    private onClientMsg(msg: { type: string, data: WebSocket.Data, target: WebSocket }) {
        let func = this.onMessage;
        if (func) {
            func.call(this, msg);
        }
    }
}

export = WebServer;