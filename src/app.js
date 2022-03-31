import Auth from "./modules/auth.js";
import * as fs from 'fs';
import request from "request-promise-native";

// Main Application

export default class App {
    constructor (sp_url, auth_email, auth_password) {
        this.sp_url = sp_url;
        this.auth_email = auth_email;
        this.auth_password = auth_password;
        this.fed_auth = undefined;
        this.rtfa = undefined;
        this.digest_token = undefined;
    }

    async authenticate () {
        await Auth.requestAuth(this);
    }

    async getFolders () {
        let url = this.sp_url + "/_api/web/GetFolderByServerRelativeUrl('/sites/msteams_654c7f/Documentos%20Compartilhados')/Folders";

        const header_opts =  {
            headers : {
                cookie: `${this.fed_auth}; ${this.rtfa}`,
                "X-RequestDigest": this.digest_token,
            }
        }

        await request.get(url, header_opts, (err, res, body) => {
            console.log(res.headers["content-type"])
            console.log(body)
        })
    }

    async requestFile () {
        let url = "https://fiapcom.sharepoint.com/sites/msteams_654c7f/_api/Web/GetFileByServerRelativePath(decodedurl='/sites/msteams_654c7f/Documentos%20Compartilhados/Ai%20E%20Chatbot/Procedimento%20para%20e-mail%20pessoal.pdf')/$value"

        const header_opts = {
            cookie: `${this.fed_auth}; ${this.rtfa}`,
            "X-RequestDigest": this.digest_token,
        }

        const file = fs.createWriteStream('./download/pdf.pdf');
        
        await this.downloadFile(url, header_opts , file);

        console.log("Terminado código")
    }

    async downloadFile (downloadUrl, header_opts, pipeline) {
        console.log("Começar Pipeline")
        return new Promise((res, rej) => {
            request.get(downloadUrl, {headers: header_opts} ).pipe(pipeline).on("finish", () => {vc
                console.log("Terminado Pipeline")
                pipeline.close();
                res()
            })
        })
    }



}