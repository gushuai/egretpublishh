import childprocess from "child_process";

import Log = require("./Log");
export class BuildUtil {

    public static async build(opt: BuildOption) {
        let { target, project } = opt;
        switch (target) {
            case "nightly"://内网
                await this.buildNightly(project);
                break;
            case "wxgame"://微信小游戏
                await this.buildWxGame(project);
                break;
        }
    }

    public static publish(opt: BuildOption) {

    }

    private static buildNightly(project: string) {
        let dir = "E:\\publishtest\\" + project;
        let promise: Promise<number>;
        promise = new Promise<number>((resolve, reject) => {
            let process = childprocess.spawn("egret", ["build"], { cwd: dir, shell: true });

            process.stdout.on("data", (data) => {
                Log.out(`${data}`);
            });
            process.stderr.on("data", (data) => {
                Log.alert(`${data}`);
            });
            process.on("exit", (code) => {
                if (code == 0) {
                    resolve(code);
                    Log.out(`项目${project}编译成功`);
                } else {
                    reject(code);
                    Log.alert(`项目${project}编译失败，请检查`);
                }
            })
        });
        return promise;
    }

    private static buildWxGame(project: string) {

    }
}
export interface BuildOption {
    /**
     * 类型，build、publish
     */
    type: string;
    /**
     * 目标，nightly、wxgame
     */
    target: string;
    /**
     * 项目名（目录）
     */
    project: string;
}

