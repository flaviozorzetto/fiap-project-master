import request from "request-promise-native";
import fs from "fs";

export default class Sp_Link {
    static async searchLinks(app) {
        let baseUrl = app.sp_url + "/_layouts/15/sharepoint.aspx?"
        let urls = []

        await request.get(baseUrl, { headers: app.header_auth_opts }, (err, res, body) => {
            const regex = new RegExp(`(?<=${app.sp_url + "/sites/"})(.*?)(?=\\\\|\/)`, "gi");
            // Example regex
            // const regex2 = /(?<=https:\/\/etecspgov.sharepoint.com\/sites\/)(.*?)(?=\\|\/)/gi;

            let posUrls = res.body.match(regex);
            urls.push([...new Set(posUrls)].map(e => {
                return app.sp_url + `/sites/${e}`
            }))

            // Debug -> download response as txt
            // fs.writeFile("./download/res.txt", res.body, (err) => {
            //     console.log(err)
            // })
        })

        return urls.flat(Infinity);
    }
}