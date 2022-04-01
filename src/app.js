import Auth from "./modules/auth.js";
import * as fs from 'fs';
import request from "request-promise-native";
import Sp_Functions from "./helpers/sp_functions.js";

// Main Application

export default class App {
    constructor (sp_url, auth_email, auth_password) {
        this.sp_url = sp_url;
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
        const sp_func = new Sp_Functions();
        let url = this.sp_url + "/_api/web/GetFolderByServerRelativeUrl('/sites/msteams_654c7f/Documentos%20Compartilhados')/Folders";
        
        let folders = await sp_func.getFoldersFromRelativePath(url, this.header_auth_opts);
        let secondListFolder = [];

        for(let i = 0; i < folders.length; i++) {
            let folderUrl = this.sp_url + `/_api/web/GetFolderByServerRelativeUrl('${folders[i]}')/Folders`;
            
            secondListFolder.push(await sp_func.getFoldersFromRelativePath(folderUrl, this.header_auth_opts));
        }

        secondListFolder = secondListFolder.flat();

        for(let i = 0; i < secondListFolder.length; i++) {
            let folderUrl = this.sp_url + `/_api/web/GetFolderByServerRelativeUrl('${secondListFolder[i]}')/Folders`;
            
            await sp_func.getFoldersFromRelativePath(folderUrl, this.header_auth_opts, true);
        }


        // await this.getFileFromFolderList(folders);


    }

    async getFileFromFolderList(folderList) {
        
        let folders

        let url = this.sp_url + `/_api/web/GetFolderByServerRelativeUrl('${folderList[0]}')/Folders`;

        await request.get(url, {headers: this.header_auth_opts}, (err, res, body) => {
            let regexp = /(?<=\<d\:ServerRelativeUrl\>)(.*?)(?=(<\/d\:ServerRelativeUrl\>))/gi;

            folders = body.match(regexp).filter(e => { return !( /form/gi.test(e) | /recordings/gi.test(e)) /* remove form and recordings field folder */ });
        })

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