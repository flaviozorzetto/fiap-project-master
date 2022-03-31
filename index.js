import { Args_Regex_Handler } from "./src/helpers/args_handler.js";
import App from "./src/app.js";

(async () => {
    // Create error handler for args

    let argsArray = process.argv.slice(2);
    const sp_url = argsArray[0];
    const auth_email = argsArray[1];
    const auth_password = argsArray[2];

    const MyApp = new App(sp_url, auth_email, auth_password);

    await MyApp.authenticate();
    await MyApp.getFolders();

    // await MyApp.requestFile();

})()