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