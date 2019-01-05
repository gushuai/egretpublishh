"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const WebServer_1 = __importDefault(require("./WebServer"));
const SvnUtil_1 = __importDefault(require("./utils/SvnUtil"));
const Log = require("./utils/Log");
var _inprocess;
main();
function main() {
    let ser = new WebServer_1.default();
    ser.start({ port: 8787 });
    ser.onMessage = onMessage;
    Log.init(ser);
}
function onMessage(msg) {
    return __awaiter(this, void 0, void 0, function* () {
        if (_inprocess) {
            return;
        }
        let str = msg;
        let obj = JSON.parse(str);
        let { type, target, project } = obj;
        switch (type) {
        }
        _inprocess = true;
        yield checkout(project);
        console.log(2);
    });
}
function checkout(project) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = yield SvnUtil_1.default.checkOut(project);
        if (code == 0) {
            console.log("执行成功");
        }
        else {
            console.log("errorcode:" + code);
        }
    });
}
