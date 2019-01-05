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
const child_process_1 = __importDefault(require("child_process"));
const Log = require("./Log");
const fs = require("fs-extra");
class SvnUtil {
    static checkOut(project) {
        return __awaiter(this, void 0, void 0, function* () {
            let dir = "E:\\publishtest\\" + project;
            let promise;
            if (fs.existsSync(dir)) {
                promise = this.update(project);
            }
            else {
                promise = new Promise((resolve, reject) => {
                    Log.out(`开始检出项目:${project}`);
                    let process = child_process_1.default.spawn("svn", [
                        "checkout",
                        "https://172.18.0.131/svn/immortal-devel/client/trunk/shxd",
                        dir,
                        "--username",
                        "gushuai",
                        "--password",
                        "gushuai"
                    ]);
                    process.stdout.on("data", (data) => {
                        Log.out(`svncheckout:${data}`);
                    });
                    process.stderr.on("data", (data) => {
                        Log.out(`svncheckerror:${data}`);
                    });
                    process.on("exit", (code) => {
                        if (code == 0) {
                            resolve(code);
                            Log.out(`项目${project}检出成功`);
                        }
                        else {
                            reject(code);
                            Log.out(`项目${project}检出失败，请检查`);
                        }
                    });
                });
            }
            return promise;
        });
    }
    static update(project) {
        return __awaiter(this, void 0, void 0, function* () {
            let dir = "E:\\publishtest\\" + project;
            let promise = new Promise((resolve, reject) => {
                Log.out(`开始更新项目:${project}`);
                let process = child_process_1.default.spawn("svn", [
                    "update",
                    dir
                ]);
                process.stdout.on("data", (data) => {
                    Log.out(`svnupdate:${data}`);
                });
                process.stderr.on("data", (data) => {
                    Log.out(`svnupdateerror:${data}`);
                });
                process.on("exit", (code) => {
                    if (code == 0) {
                        resolve(code);
                        Log.out(`项目${project}更新成功`);
                    }
                    else {
                        reject(code);
                        Log.out(`项目${project}更新失败，请检查`);
                    }
                });
            });
            return promise;
        });
    }
}
module.exports = SvnUtil;
