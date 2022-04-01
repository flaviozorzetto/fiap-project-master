import request from "request-promise-native";

export default class Sp_Functions {

    async getFoldersFromRelativePath(url, headers, debug=false) {
        let folders
        await request.get(url, {headers: headers}, (err, res, body) => {
            let regexp = /(?<=\<d\:ServerRelativeUrl\>)(.*?)(?=(<\/d\:ServerRelativeUrl\>))/gi;
            let possibleFoldersReq = body.match(regexp);

            folders = possibleFoldersReq != null ? possibleFoldersReq.filter(e => { return !( /form/gi.test(e) | /recordings/gi.test(e)) /* remove form and recordings field folder */ }) : [];
        
            debug ? console.log(folders) : null
        })
        return folders;
    }

}