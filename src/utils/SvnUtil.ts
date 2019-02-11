
import childprocess from "child_process";
import fs = require("fs-extra");
import { Buffer } from "buffer";
import { Log } from "./Log";
class SvnUtil {

    public static async checkOut(project: string) {
        
        let dir = _rootDir + project;
        let promise: Promise<number>;
        if (fs.existsSync(dir)) {
            promise = this.update(project);
        } else {
            promise = new Promise<number>((resolve, reject) => {
                Log.out(`开始检出项目:${project}`);
                let process = childprocess.spawn("svn", [
                    "checkout",
                    "https://172.18.0.131/svn/immortal-devel/client/trunk/shxd",
                    dir,
                    "--username",
                    "gushuai",
                    "--password",
                    "gushuai"
                ]);

                process.stdout.on("data", (data) => {
                    let buffer = new Buffer(data);
                    // Log.out(`svncheckout:${data}`);
                    Log.out("svncheckout:" + buffer.toString());
                });
                process.stderr.on("data", (data) => {
                    Log.alert(`svncheckerror:${data}`);
                    reject(data.message);
                });
                process.on("exit", (code) => {
                    if (code == 0) {
                        resolve(code);
                        Log.out(`项目${project}检出成功`);
                    } else {
                        reject(code);
                        Log.alert(`项目${project}检出失败，请检查`);
                    }
                })
            });
        }
        return promise;
    }

    public static async update(project: string) {
        let dir = "E:\\publishtest\\" + project;
        let promise = new Promise<number>((resolve, reject) => {
            Log.out(`开始更新项目:${project}`);
            let process = childprocess.spawn("svn", [
                "update",
                dir
            ]);

            process.stdout.on("data", (data) => {
                Log.out(`svnupdate:${data}`);
            });
            process.stderr.on("data", (data) => {
                Log.alert(`svnupdateerror:${data}`);
            });
            process.on("exit", (code) => {
                if (code == 0) {
                    resolve(code);
                    Log.out(`项目${project}更新成功`);
                } else {
                    reject(code);
                    Log.alert(`项目${project}更新失败，请检查`);
                }
            })
        });
        return promise;
    }

}
export = SvnUtil;