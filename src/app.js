import Auth from "./modules/auth.js";
import Sp_Link from "./modules/sp_link.js";
import * as fs from 'fs';
import request from "request-promise-native";
import Sp_Functions from "./helpers/sp_functions.js";

// Main Application

export default class App {
    constructor ({sp_url, auth_email, auth_password}) {
        this.sp_url = sp_url ? sp_url : undefined;
        this.sp_relative_prefix = sp_url ? sp_url.match(/\/sites\/.*/gi)[0] : undefined;
        this.sp_base_folder_name = undefined
        this.auth_email = auth_email;
        this.auth_password = auth_password;
        this.fed_auth = undefined;
        this.rtfa = undefined;
        this.digest_token = undefined;
        this.header_auth_opts = undefined
    }

    async getSpUrls () {
        console.log("Procurando por links sharepoint relacionados a sua conta.");
        return await Sp_Link.searchLinks(this);
    }

    async authenticate () {
        await Auth.requestAuth(this);
    }

    // master development right now
    async getFolders () {

        const sp_func = new Sp_Functions();
        
        this.sp_base_folder_name = await sp_func.getBaseFolderName(this.sp_url, this.header_auth_opts);

        let baseFolderPath = [`${this.sp_relative_prefix}/${this.sp_base_folder_name}`];
        
        let allFolderPaths = await this.retrieveAllFoldersList(baseFolderPath, sp_func);

        console.log("Folders:", allFolderPaths)
        
        let allFilePaths = await this.getFilePaths(allFolderPaths, sp_func);
        console.log("Files:", allFilePaths)
        
    }

    async retrieveAllFoldersList(mainFoldersList, sp_func) {
        
        return await this.wormChain(mainFoldersList, sp_func).then(e => e.flat(Infinity).sort()).catch(err => {throw new Error(err)});
    
    }

    async wormChain(fl, sp_func, aTadd = []) {

        const worm = async (folderList, sp_func, arrayToAdd) => {
            for(let i = 0; i < folderList.length; i++){
                
                let folderUrl = this.sp_url + `/_api/web/GetFolderByServerRelativeUrl('${folderList[i]}')/Folders`;

                let tempArr = await sp_func.getFoldersFromRelativePath(folderUrl, this.header_auth_opts)

                arrayToAdd.push(tempArr)

                if(tempArr.length != 0){
                    await worm (tempArr, sp_func, arrayToAdd);
                }
            }
        }

        await worm(fl, sp_func, aTadd);

        return aTadd
    }

    async getFilePaths (folderPathsList, sp_func) {
        let returnPaths = [];

        for(let i = 0; i < folderPathsList.length; i++) {
            let fileUrl = this.sp_url + `/_api/web/GetFolderByServerRelativeUrl('${folderPathsList[i]}')/Files`;

            returnPaths.push(await sp_func.getFilePathsFromRelativePath(fileUrl, this.header_auth_opts));
        }

        return returnPaths.flat(Infinity).sort();
    }

    // testing experimental (important) //
    async requestFile () {
        let url = "https://fiapcom.sharepoint.com/sites/msteams_654c7f/_api/Web/GetFileByServerRelativePath(decodedurl='/sites/msteams_654c7f/Documentos%20Compartilhados/Ai%20E%20Chatbot/Procedimento%20para%20e-mail%20pessoal.pdf')/$value"

        const file = fs.createWriteStream('./download/pdf_file.pdf');
        
        await this.downloadFile(url, this.header_auth_opts , file);

        console.log("Terminado código")
    }

    async downloadFile (downloadUrl, header_opts, pipeline) {
        console.log("Começar Pipeline")
        return new Promise((res, rej) => {
            request.get(downloadUrl, {headers: header_opts} ).pipe(pipeline).on("finish", () => {
                console.log("Terminado Pipeline")
                pipeline.close();
                res()
            })
        })
    }

}