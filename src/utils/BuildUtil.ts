import childprocess from "child_process";

import Log = require("./Log");

import fs from "fs-extra";
import archiver from "archiver";
import ssh from "ssh2";
export class BuildUtil {

    public static async build(opt: BuildOption) {
        let { target, project } = opt;
        try {
            switch (target) {
                case "nightly"://内网
                    await this.buildProject(project, ["build"]);
                    // let arr = ["bin-debug", "manifest.json", "zlib", "index.html", "ani", "libs", "map", "resource"];
                    // let filePath = await this.makeZip(_rootDir + project + "/", project, arr);
                    // await this.upload(filePath, `${_remoteNightly}/${project}/`, "nightly", project);
                    break;
                case "wxgame"://微信小游戏
                    await this.buildWxGame(project);
                    break;
            }
        } catch (e) {
            Log.out("执行buid时产生错误:" + e.message);
        }
    }

    public static async publish(opt: BuildOption) {
        let { project } = opt;
        try {
            await this.buildProject(project, ["publish"]);
            let arr = ["zlib", "map", "ani"];
            let path = _rootDir + project + "/bin-release/web/";
            let tmparr = fs.readdirSync(path);
            let len = tmparr.length;
            let max = +tmparr[0];
            if (len > 1) {
                max = 0;
                for (let i = 0; i < len; i++) {
                    let num = +tmparr[i];
                    if (num > max) {
                        max = num;
                    }
                }
            }
            path = path + max + "/";
            len = arr.length;

            for (let i = 0; i < len; i++) {
                let tmppath = _rootDir + project + "/" + arr[i];
                await this.copyDir(tmppath, path + arr[i]);
            }
            arr = ["zlib", "map", "index.html", "manifest.json", "resource", "js"];
            let filePath = await this.makeZip(path, project, arr);
            if (filePath) {
                await this.upload(filePath, `${_remoteRootDir}/${project}/`, "publish", project);
            }
            await fs.remove(_rootDir + project + "/bin-release");
        } catch (e) {

        }
    }

    /**
     * 
     * @param project 项目名
     * @param params 参数（例：["build"]）
     */
    private static buildProject(project: string, params: string[]) {
        let dir = _rootDir + project;
        let promise: Promise<number>;
        promise = new Promise<number>((resolve, reject) => {
            let process = childprocess.spawn("egret", params, { cwd: dir, shell: true });

            process.stdout.on("data", (data) => {
                Log.out(`${data}`);
            });
            process.stderr.on("data", (data) => {
                Log.out(`${data}`);
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


    private static copyDir(from: string, to: string) {
        let promise = new Promise<void>((resolve, reject) => {
            fs.copy(from, to, (err) => {
                if (err) {
                    reject();
                } else {
                    resolve();
                }
            })
        });
        return promise;
    }

    /**
     * 
     * @param dir 要打包的文件所在目录(例：E:/webproject/test/)
     * @param project 打包后的zip包名(可用项目名)
     * @param arr 要打包的文件（文件夹）列表
     */
    private static makeZip(dir: string, project: string, arr: string[]) {
        let promise: Promise<string>;
        let len = arr.length;
        promise = new Promise<string>((resolve, reject) => {
            let arch = archiver("zip");
            let zippath = _rootDir + project + ".zip";
            let output = fs.createWriteStream(zippath);
            Log.out("开始创建压缩包……");

            output.on("close", () => {
                resolve(zippath);
                Log.progressEnd("压缩包创建完成：" + zippath);
            });

            arch.on("error", (err) => {
                reject();
                Log.out(`创建压缩包失败:${err.message}`);
            });

            arch.on("warning", (err) => {
                if (err.code == "ENOENT") {
                    Log.out("zipwarn:" + err.message);
                } else {
                    reject();
                    Log.out(`创建压缩包失败:${err.message}`);
                }
            });

            arch.on("progress", (pro) => {
                let { total, processed } = pro.entries;
                let per = processed / total;
                Log.progress(`压缩中:${per * 100}` + "%");
            })

            arch.pipe(output);

            for (let i = 0; i < len; i++) {
                let tmpname = arr[i];
                let path = dir + tmpname
                if (fs.existsSync(path)) {
                    let stat = fs.statSync(path);
                    if (stat.isFile()) {
                        arch.file(path, { name: tmpname });
                    } else if (stat.isDirectory()) {
                        arch.directory(path + "/", tmpname);
                    }
                }
            }
            arch.finalize();
        });
        return promise;
    }

    /**
     * 
     * @param filePath 要上传的zip包全路径
     * @param remoteDir 需要传至的远程目录（例：/home/test/）
     * @param type 区分内网包还是外网包或者其他（publish、nightly）
     * @param project 项目名
     */
    private static upload(filePath: string, remoteDir: string, type: string, project: string) {
        let promise: Promise<void>;
        promise = new Promise<void>((resolve, reject) => {
            let sh = new ssh.Client();
            sh.on("ready", () => {
                Log.out("成功连接至远程服务器");
                sh.sftp((err, sftp) => {
                    if (sftp) {
                        sftp.lstat(remoteDir, (err, stats) => {
                            if (err) {
                                //这里的代码废除，直接在远程服务器上事先创建好文件夹
                                if (err.message == "No such file") {
                                    let arr = remoteDir.split("/");
                                    let cmd = "cd / ";
                                    let len = arr.length;
                                    for (let i = 0; i < len; i++) {
                                        let tmp = arr[i];
                                        if (tmp) {
                                            cmd += "&& mkdir " + tmp + " && cd " + tmp + " ";
                                        }
                                    }
                                    sh.exec(cmd, (err, channel) => {
                                        if (err) {
                                            Log.alert("创建远程文件夹失败：" + err.message);
                                            reject();
                                        } else {
                                            tryUpload(type, sftp, sh, resolve, reject);
                                        }
                                    });
                                }
                            } else {
                                tryUpload(type, sftp, sh, resolve, reject);
                            }
                        })

                    } else if (err) {
                        reject();
                        Log.out("SFTP ERROR:" + err.message);
                    }
                })
            });
            sh.on("error", (err) => {
                Log.alert("连接远程服务器时发生错误:" + err.message);
                reject();
            });
            sh.on("close", () => {
                Log.out("与远程服务器断开连接");
            });
            Log.out("尝试连接远程服务器");
            sh.connect({ host: "127.0.0.1", port: 22, username: "admin", password: "admin" });
        });
        return promise;

        /**
         * 
         * @param type 
         * @param sftp 
         * @param sh 
         * @param resolve 
         * @param reject 
         */
        function tryUpload(type: string, sftp: ssh.SFTPWrapper, sh: ssh.Client, resolve: Function, reject: Function) {
            switch (type) {
                case "publish":
                    readVer(sftp, remoteDir, (ver: number) => {
                        uploadFile(type, filePath, remoteDir, "web" + ver, sh, sftp, resolve, reject);
                    });
                    break;
                case "nightly":
                    uploadFile(type, filePath, remoteDir, project, sh, sftp, resolve, reject);
                    break;
            }
        }

        /**
         * 
         * @param sftp 
         * @param dir 远程版本文件所在根目录(例:/web/test/)
         * @param callback 
         */
        function readVer(sftp: ssh.SFTPWrapper, dir: string, callback: Function) {
            let path = dir + "ver.txt";
            sftp.readFile(path, "UTF-8", (err, buffer) => {
                let ver = 0;
                if (err) {
                    if (err.message == "No such file") {
                        ver = 0;
                    }
                } else {
                    let str = buffer.toString();
                    ver = +str;
                }
                let output = sftp.createWriteStream(path, { encoding: "UTF-8" });
                output.write((ver + 1) + "", (err) => {
                    if (err) {
                        Log.alert("创建版本文件失败:" + err.message);
                    } else {
                        callback(ver + 1);
                    }
                });
            })
        }

        /**
         * 
         * @param type 
         * @param filePath zip包全路径
         * @param remotePath 需要传至的远程目录（例：/home/test/）
         * @param fileName 上传后重命名zip包的包名（nightly类型下有效）
         * @param sh 
         * @param sftp 
         * @param resolve 
         * @param reject 
         */
        function uploadFile(type: string, filePath: string, remotePath: string, fileName: string, sh: ssh.Client, sftp: ssh.SFTPWrapper, resolve: Function, reject: Function) {
            Log.out("开始上传压缩包至远程服务器");
            let date = new Date();
            let name = date.getFullYear() + "-" + fillZero(date.getMonth() + 1) + "-" + fillZero(date.getDate()) + "-" + fillZero(date.getHours()) + "-" + fillZero(date.getMinutes()) + "-" + fillZero(date.getSeconds());
            if (type == "nightly") {
                name = fileName;
            }
            sftp.fastPut(filePath, remotePath + name, {
                step: (total_transferred: number, chunk: number, total: number) => {
                    Log.progress("文件上传中：" + total_transferred + "/" + total);
                }
            }, (err) => {
                if (err) {
                    Log.alert("文件上传发生错误:" + err.message);
                    reject();
                } else {
                    Log.progressEnd("文件上传成功");
                    Log.out("开始解压文件");
                    let cmd = "";
                    switch (type) {
                        case "publish":
                            cmd = `cd ${remotePath} && unzip ${name} -d ${fileName}`;
                            break;
                        case "nightly":
                            cmd = `cd ${remotePath} && unzip -o ${name}`;
                            break;
                    }
                    sh.exec(cmd, (err, channel) => {
                        if (channel) {
                            channel.once("data", (data: any) => {
                                Log.out(`解压文件:${data}`);
                            });
                            channel.on("exit", () => {
                                Log.out("文件解压完成");
                                sh.end();
                                resolve();
                            })
                        }
                    })
                }
            });
            function fillZero(val: number) {
                if (val < 10) {
                    return "0" + val;
                }
                return val;
            }
        }
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

