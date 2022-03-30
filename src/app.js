import Auth from "./modules/auth.js";
import fetch from "node-fetch";
import * as fs from 'fs';
import request from "request-promise-native";
import base64 from "base64topdf";

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

    async requestFile () {
        let url = "https://fiapcom.sharepoint.com/sites/msteams_654c7f/_api/Web/GetFileByServerRelativePath(decodedurl='/sites/msteams_654c7f/Documentos%20Compartilhados/Ai%20E%20Chatbot/Procedimento%20para%20e-mail%20pessoal.pdf')/$value"
        
        let header_opts = {
            cookie: `${this.fed_auth}; ${this.rtfa}`,
            "X-RequestDigest": this.digest_token
        }


        // Approach 1

        // let request = await fetch(url, {
        //     method: 'get',
        //     headers: {
        //         'Content-type': 'application/pdf',
        //         cookie: `${this.fed_auth}; ${this.rtfa}`,
        //         "X-RequestDigest": this.digest_token
        //     }
        // })

        // const data = await request.text();

        // console.log("Começar a gravar");
        // fs.writeFileSync("./download/file.pdf", data, 'binary');
        // console.log("Gravado!");



        // Approach 2

        await request.get(url, {headers: header_opts}, async function (error, response, body) {
            let type = response.headers["content-type"];
            let length = response.headers["content-length"]

            console.log(response.body == body)

            console.log(type)
            
            fs.writeFileSync("./download/file.bin", response.body, 'binary')
        })

    }

}