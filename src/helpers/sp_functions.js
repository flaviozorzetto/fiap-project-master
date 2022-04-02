import request from "request-promise-native";
import he from "he";

export default class Sp_Functions {

    async getFoldersFromRelativePath(url, headers, debug=false) {
        let folders
        await request.get(url, {headers: headers}, (err, res, body) => {
            let regexp = /(?<=\<d\:ServerRelativeUrl\>)(.*?)(?=(<\/d\:ServerRelativeUrl\>))/gi;
            let possibleFoldersReq = body.match(regexp);
            
            folders = possibleFoldersReq != null ? possibleFoldersReq.filter(e => { return !( /form/gi.test(e) | /recordings/gi.test(e)) /* remove form and recordings field folder */ }).map(e => this.sanitizeUrl(e)) : [];

            debug ? console.log(folders) : null
        })
        return folders;
    }

    async getFilePathsFromRelativePath(url, headers, debug=false) {
        let filePaths

        await request.get(url, {headers: headers}, (err, res, body) => {
            let regexp = /(?<=\<d\:ServerRelativeUrl\>)(.+?)(?=\<\/d\:ServerRelativeUrl\>)/gi;
            let possibleFilesReq = body.match(regexp);

            filePaths = possibleFilesReq != null ? possibleFilesReq.map(e => this.sanitizeUrl(e)) : [];

            debug ? console.log(filePaths) : null
        })

        return filePaths
    }

    async getBaseFolderName(url, headers) {
        let folderName
        await request.get(url, {headers: headers}, (err, res, body) => {
            let regexp = /(shared documents|documentos compartilhados)/gi
            let tempArr = res.body.match(/(\"Url\"\:\"\/)(.{1,200})/gi).filter(e => {
                return regexp.test(e)
            });
            folderName = tempArr[0].match(regexp)[0]
        })
        return folderName
    }

    sanitizeUrl (url) {
        // HTML entities
        let entityRegex = /(\&)(.*?)(\;)/gi;
        if(entityRegex.test(url)){
            url = url.replace(entityRegex, (match) => {
                return he.decode(match)
            })
        }
        // End of HTML entities

        return url
    }

}