import Auth from "./modules/auth.js";

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

}