import request from "request-promise-native";
import he from "he";

export default class Sp_Explorer {

    async getFoldersFromRelativePath(url, headers) {
        let folders
        await request.get(url, {headers: headers}, (err, res, body) => {
            let regexp = /(?<=\<d\:ServerRelativeUrl\>)(.*?)(?=(<\/d\:ServerRelativeUrl\>))/gi;
            let possibleFoldersReq = body.match(regexp);
            
            folders = possibleFoldersReq != null ? possibleFoldersReq.filter(e => { return !( /form/gi.test(e) | /recordings/gi.test(e)) /* remove form and recordings field folder */ }).map(e => this.sanitizeUrl(e)) : [];
        })
        return folders;
    }

    async getFilePathsFromRelativePath(url, headers) {
        let filePaths

        await request.get(url, {headers: headers}, (err, res, body) => {
            let regexp = /(?<=\<d\:ServerRelativeUrl\>)(.+?)(?=\<\/d\:ServerRelativeUrl\>)/gi;

            let possibleFilesReq = body.match(regexp);
            
            filePaths = possibleFilesReq != null ? possibleFilesReq.map(e => this.sanitizeUrl(e)) : [];
        })


        return filePaths
    }

    async getBaseFolderName(url, headers) {
        let folderName
        console.log("Pegando o nome base para montagem da url...")
        await request.get(url, {headers: headers}, (err, res, body) => {
            let regexp = /(shared documents|documentos compartilhados)/gi
            let tempArr = res.body.match(/(\"Url\"\:\"\/)(.{1,200})/gi).filter(e => {
                return regexp.test(e)
            });
            folderName = tempArr[0].match(regexp)[0]
        })
        console.log("Nome base:", folderName)
        return folderName
    }

    async getAllDirectoryInfo (app) {
        app.sp_base_folder_name = await this.getBaseFolderName(app.sp_url, app.header_auth_opts);

        let baseFolderPath = [`${app.sp_relative_prefix}/${app.sp_base_folder_name}`];
        
        console.log("Pesquisando todos os paths das pastas do sistema...");
        let allFolderPaths = await this.retrieveAllFoldersList(baseFolderPath, app);
        app.directoryInfo.foldersPath.push(...allFolderPaths);
        
        console.log("Pesquisando todos os paths dos arquivos do sistema...");
        let allFilePaths = await this.getAllFilePaths(allFolderPaths, app);
        app.directoryInfo.filesPath.push(...allFilePaths);
    }

    async retrieveAllFoldersList(mainFoldersList, app) {
        
        return await this.wormChain(mainFoldersList, app).then(e => e.flat(Infinity).sort()).catch(err => {throw new Error(err)});
    
    }

    async wormChain(fl, app, aTadd = []) {
        const worm = async (folderList, arrayToAdd) => {
            for(let i = 0; i < folderList.length; i++){
                let folderUrl = app.sp_url + `/_api/web/GetFolderByServerRelativeUrl('${folderList[i]}')/Folders`;

                let tempArr = await this.getFoldersFromRelativePath(folderUrl, app.header_auth_opts)

                arrayToAdd.push(tempArr)

                if(tempArr.length != 0){
                    await worm (tempArr, arrayToAdd);
                }
            }
        }

        await worm(fl, aTadd);
        return aTadd
    }

    async getAllFilePaths (folderPathsList, app) {
        let returnPaths = [];

        for(let i = 0; i < folderPathsList.length; i++) {
            let fileUrl = app.sp_url + `/_api/web/GetFolderByServerRelativeUrl('${folderPathsList[i]}')/Files`;

            returnPaths.push(await this.getFilePathsFromRelativePath(fileUrl, app.header_auth_opts));
        }

        return returnPaths.flat(Infinity).sort();
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