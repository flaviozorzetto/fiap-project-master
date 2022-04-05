import Sp_Auth from "./modules/sp/sp_auth.js";
import Sp_Link from "./modules/sp/sp_link.js";
import Sp_Explorer from "./modules/sp/sp_explorer.js";
import Sp_Downloader from "./modules/sp/sp_downloader.js";

// Main Application

export default class App {
    constructor ({sp_url, auth_email, auth_password}) {
        //url props
        this.sp_url = sp_url ? sp_url : undefined;
        this.sp_relative_prefix = sp_url ? sp_url.match(/\/sites\/.*/gi)[0] : undefined;
        this.sp_base_folder_name = undefined

        //folder props
        this.directoryInfo = { 
            foldersPath : [],
            filesPath : [],
        }
        
        //credential props
        this.auth_email = auth_email;
        this.auth_password = auth_password;

        //endpoint auth props
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
        console.log("Autenticando no Sharepoint...")
        await Sp_Auth.requestAuth(this);
        console.log("Autenticado!")
    }

    async getFolders (showFiles = false) {
        const sp_explorer = new Sp_Explorer();

        await sp_explorer.getAllDirectoryInfo(this)

        showFiles ? console.log(this.directoryInfo) : null;
    }

    async downloadFiles () {
        let sp_downloader = new Sp_Downloader(this.sp_url, this.directoryInfo, this.header_auth_opts);

        await sp_downloader.enqueueFiles("./download");
    }

}