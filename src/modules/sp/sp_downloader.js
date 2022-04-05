import request from "request-promise-native";
import fs from "fs"

export default class Sp_Downloader {
    constructor (sp_url, directoryInfo, header_auth_opts) {
        this.sp_url = sp_url;
        this.directoryInfo = directoryInfo;
        this.header_auth_opts = header_auth_opts
    }

    async enqueueFiles(path) {
        let filesPath = this.directoryInfo.filesPath

        console.time("Tempo de execução:");
        for(let i = 0; i < filesPath.length; i++) {

            let restUrl = this.sp_url + `/_api/Web/GetFileByServerRelativePath(decodedurl='${encodeURI(filesPath[i])}')/$value`

            let fileExt = filesPath[i].match(/(\.)(\w+?)$/i)[0];
            let text = "Baixando arquivo " + (i + 1) + " de " + filesPath.length;

            const file = fs.createWriteStream(path + "/file_" + i + fileExt);

            await this.downloadFile(restUrl, this.header_auth_opts, file, text)
        }
        console.timeEnd("Tempo de execução:");
    }

    async downloadFile (downloadUrl, header_opts, pipeline, text) {
        console.log(text)
        return new Promise((res, rej) => {
            request.get(downloadUrl, {headers: header_opts} ).pipe(pipeline).on("finish", () => {
                pipeline.close();
                res()
            })
        })
    }
}