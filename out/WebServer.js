"use strict";
const ws_1 = require("ws");
class WebServer {
    constructor() {
        this._clients = [];
        this.onMessage = undefined;
    }
    start(opt) {
        let server = new ws_1.Server(opt);
        let _self = this;
        server.on("connection", (client) => {
            _self.onClientConnet(client);
        });
    }
    broadCast(msg) {
        let clients = this._clients;
        if (clients) {
            let len = clients.length;
            for (let i = 0; i < len; i++) {
                let client = clients[i];
                client.send(msg);
            }
        }
    }
    alert(msg) {
    }
    onClientConnet(client) {
        let _self = this;
        _self._clients.push(client);
        client.onmessage = (msg) => {
            _self.onClientMsg(msg);
        };
        client.onclose = (e) => {
            _self.onClientClose(e.target);
        };
    }
    onClientClose(client) {
        let inx = this._clients.indexOf(client);
        this._clients.splice(inx);
    }
    onClientMsg(msg) {
        let func = this.onMessage;
        if (func) {
            func.call(this, msg.data);
        }
    }
}
module.exports = WebServer;
