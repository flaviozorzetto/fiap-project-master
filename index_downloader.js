import App from "./src/app.js";
import Prompter from "./src/modules/prompt/prompter.js";

// Download Files
(async () => {
    const prompt = new Prompter();
    const promptResult = await prompt.build(true);

    const MyApp = new App({ sp_url: promptResult.url, auth_email: promptResult.user, auth_password: promptResult.password });

    await MyApp.authenticate();

    await MyApp.getFolders();

    await MyApp.downloadFiles();

})()