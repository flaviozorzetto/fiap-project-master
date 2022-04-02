import { Args_Regex_Handler } from "./src/helpers/args_handler.js";
import App from "./src/app.js";

(async () => {
    // Clear Terminal 
    process.stdout.write('\x1Bc'); 

    // Create error handler for args

    let argsArray = process.argv.slice(2);

    if(argsArray.length == 3) {
        const sp_url = argsArray[0];
        const auth_email = argsArray[1];
        const auth_password = argsArray[2];
    
        const MyApp = new App({sp_url : sp_url, auth_email : auth_email, auth_password : auth_password});
    
        await MyApp.authenticate();
    
        await MyApp.getFolders();
    
        // await MyApp.requestFile();

    } else {

        const auth_email = argsArray[0];
        const auth_password = argsArray[1];

        const MyApp = new App({auth_email: auth_email, auth_password: auth_password});

        await MyApp.authenticate();

        const links = await MyApp.getSpUrls();

        console.log("Links retornados:", links)

    }

})()