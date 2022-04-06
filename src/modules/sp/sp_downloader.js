import request from "request-promise-native";
import fs from "fs"
import path from "path";
import colors from "@colors/colors/safe.js";

export default class Sp_Downloader {
    constructor(sp_url, directoryInfo, header_auth_opts, sp_base_folder_name) {
        this.sp_url = sp_url;
        this.directoryInfo = directoryInfo;
        this.header_auth_opts = header_auth_opts
        this.sp_base_folder_name = sp_base_folder_name
    }

    async enqueueFiles(downloadPath, regex) {
        let regexp = new RegExp(`${regex}`, "gi")
        
        let filesPath = this.directoryInfo.filesPath.filter((e) => {
            return regexp.test(e);
        })

        let t = 20

        console.time("Tempo de execução:");
        for (let i = 0; i < filesPath.length; i += t) {
            let shouldBreak = false
            if (i + t >= filesPath.length) {
                t = filesPath.length - i;
                shouldBreak = true
            }
            let downloadersArr = []

            for (let x = i; x < i + t; x++) {
                let folderRegex = new RegExp(`(?<=${this.sp_base_folder_name}\/)(.+)`, "gi");

                let basePath = downloadPath + "/" + filesPath[x].match(folderRegex)[0];

                let dirname = path.dirname(basePath)

                if (!fs.existsSync(dirname)) {
                    fs.mkdirSync(dirname, { recursive: true })
                }

                let url = this.sp_url + `/_api/Web/GetFileByServerRelativePath(decodedurl='${encodeURI(filesPath[x])}')/$value`;

                let text = (x + 1) + " de " + filesPath.length;

                let file = fs.createWriteStream(basePath);

                downloadersArr.push(this.downloadFile(url, this.header_auth_opts, file, text, basePath))
            }

            await Promise.all(downloadersArr)

            if (shouldBreak) {
                break
            }
        }
        console.timeEnd("Tempo de execução:");

    }

    async downloadFile(downloadUrl, header_opts, pipeline, text, basePath) {
        console.log("Baixando arquivo " + text + " no diretório: " + basePath)
        return new Promise((resolve, rej) => {
            request.get(downloadUrl, { headers: header_opts })
                .on('response', function (response) {
                    if(response.headers["content-length"] > 100000000) {
                        const text = colors.red.bold("Arquivo muito grande, não foi possivel fazer o download: "+ pipeline.path)
                        console.log(text);
                        pipeline.close();
                        fs.unlinkSync(pipeline.path);
                        resolve()
                    } else {
                        response.pipe(pipeline).on("finish", () => {
                            pipeline.close();
                            console.log("Arquivo: " + text + " Finalizado")
                            resolve()
                        })
                    }
                })
        })
    }
}