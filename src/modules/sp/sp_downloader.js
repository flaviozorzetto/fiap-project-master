import request from "request-promise-native";
import fs from "fs"

export default class Sp_Downloader {
    constructor(sp_url, directoryInfo, header_auth_opts) {
        this.sp_url = sp_url;
        this.directoryInfo = directoryInfo;
        this.header_auth_opts = header_auth_opts
    }

    async enqueueFiles(path) {
        let filesPath = this.directoryInfo.filesPath
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
                let url = this.sp_url + `/_api/Web/GetFileByServerRelativePath(decodedurl='${encodeURI(filesPath[x])}')/$value`;

                let ext = filesPath[x].match(/(\.)(\w+?)$/i)[0];

                let text = "Baixando arquivo " + (x + 1) + " de " + filesPath.length;

                let file = fs.createWriteStream(path + "/file_" + x + ext);

                downloadersArr.push(this.downloadFile(url, this.header_auth_opts, file, text))
            }

            await Promise.all(downloadersArr)

            if (shouldBreak) {
                break
            }
        }
        console.timeEnd("Tempo de execução:");

    }

    async downloadFile(downloadUrl, header_opts, pipeline, text) {
        console.log(text)
        return new Promise((res, rej) => {
            request.get(downloadUrl, { headers: header_opts }).pipe(pipeline).on("finish", () => {
                pipeline.close();
                console.log("Arquivo: " + text + " Finalizado")
                res()
            })
        })
    }
}