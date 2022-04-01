import Auth from "./modules/auth.js";
import * as fs from 'fs';
import request from "request-promise-native";
import Sp_Functions from "./helpers/sp_functions.js";

// Main Application

export default class App {
    constructor (sp_url, auth_email, auth_password) {
        this.sp_url = sp_url;
        this.sp_relative_prefix = sp_url.match(/\/sites\/.*/gi)[0];
        this.auth_email = auth_email;
        this.auth_password = auth_password;
        this.fed_auth = undefined;
        this.rtfa = undefined;
        this.digest_token = undefined;
        this.header_auth_opts = undefined
    }

    async authenticate () {
        await Auth.requestAuth(this);
    }

    // master development right now
    async getFolders () {
        let baseFolderPath = [`${this.sp_relative_prefix}/Shared Documents`]

        const sp_func = new Sp_Functions();
        
        let allFolderPaths = await this.retrieveAllFoldersList(baseFolderPath, sp_func).then(e => e.flat(Infinity).sort()).catch(err => {throw new Error(err)});

        console.log(allFolderPaths)
    }

    async retrieveAllFoldersList(mainFoldersList, sp_func) {
        
        return await this.wormChain(mainFoldersList, sp_func);
    
    }

    async wormChain(fl, sp_func, aTadd = []) {

        const worm = async (folderList, sp_func, arrayToAdd) => {
            for(let i = 0; i < folderList.length; i++){
                
                let folderUrl = this.sp_url + `/_api/web/GetFolderByServerRelativeUrl('${folderList[i]}')/Folders`;

                let tempArr = await sp_func.getFoldersFromRelativePath(folderUrl, this.header_auth_opts, false)

                arrayToAdd.push(tempArr)

                if(tempArr.length != 0){
                    await worm (tempArr, sp_func, arrayToAdd);
                }
                
            }
        }

        await worm(fl, sp_func, aTadd);

        return aTadd
    }


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