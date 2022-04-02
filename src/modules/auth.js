import * as spauth from "node-sp-auth";
import fetch from 'node-fetch';

export default class Auth {
    static async requestAuth(app) {
        if(app.sp_url == undefined){
            if(app.auth_email.includes(".br")){
                app.sp_url = "https://" + app.auth_email.match(/(?<=\@)(.*?)(?=\.br)/gi)[0].replaceAll(".", "") + ".sharepoint.com"
            } else {
                app.sp_url = "https://" + app.auth_email.match(/(?<=\@)(.*)/gi)[0].replaceAll(".", "") + ".sharepoint.com"
            }
        }

        async function getCookieAuth () {
        
            await spauth.getAuth(app.sp_url, {
                
                username: app.auth_email,
                password: app.auth_password,
                
            }).then(data => {
                
                const auth_cookie_list = data.headers.Cookie.split("; ");
                app.fed_auth = auth_cookie_list[0];
                app.rtfa = auth_cookie_list[1];
                
            })
            
        }

        async function getToken () {
            const opts = {
                method: "post",
                headers: {
                    cookie: `${app.fed_auth}; ${app.rtfa}`,
                }
            }
            
            const response = await fetch (app.sp_url + "/_api/contextinfo", opts);
            const raw_data = await response.text();
            
            const dig_value = getDigestValue(raw_data);
            
            app.digest_token = dig_value;

            app.header_auth_opts = {
                cookie: `${app.fed_auth}; ${app.rtfa}`,
                "X-RequestDigest": app.digest_token,
            }
        }

        function getDigestValue(data) {
            const regex = /(?<=\<d:FormDigestValue\>)((\d|\D)+)(?=\,)/g;
            
            return regex.test(data) ? data.match(regex)[0] : "null";
        }

        await getCookieAuth();
        await getToken();

    }
}