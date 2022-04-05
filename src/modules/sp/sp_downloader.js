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
        let t = 10

        console.time("Tempo de execução:");
        for(let i = 0; i < filesPath.length; i+=t) {
            let restUrlsObj = { }
            let fileExtObj = { }
            let textObj = { }
            let filesObj = { }
            let downloadersArr = []

            for(let x = i; x < i + t; x++) {
                restUrlsObj["restUrl_" + x] = this.sp_url + `/_api/Web/GetFileByServerRelativePath(decodedurl='${encodeURI(filesPath[x])}')/$value`;
                fileExtObj["fileExt_" + x] = filesPath[x].match(/(\.)(\w+?)$/i)[0];
                textObj["text_" + x] = "Baixando arquivo " + x + " de " + filesPath.length;
                filesObj["file_" + x] = fs.createWriteStream(path + "/file_" + x + fileExtObj["fileExt_" + x]);
                downloadersArr.push(this.downloadFile(restUrlsObj["restUrl_" + x], this.header_auth_opts, filesObj["file_" + x],textObj["text_" + x])) 
            }

            await Promise.all(downloadersArr)

            break
        }
        console.timeEnd("Tempo de execução:");

    }

    async downloadFile (downloadUrl, header_opts, pipeline, text) {
        console.log(text)
        return new Promise((res, rej) => {
            request.get(downloadUrl, {headers: header_opts} ).pipe(pipeline).on("finish", () => {
                pipeline.close();
                console.log("Arquivo: " + text + " Finalizado")
                res()
            })
        })
    }
}