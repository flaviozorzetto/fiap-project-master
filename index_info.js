import App from "./src/app.js";
import Prompter from "./src/modules/prompt/prompter.js";

//Get info from SP
(async () => {
    const prompt = new Prompter();
    
    const promptResult = await prompt.build();

    if(promptResult.hasOwnProperty("url")) {
        
        const MyApp = new App({sp_url : promptResult.url, auth_email : promptResult.user, auth_password : promptResult.password});
    
        await MyApp.authenticate();
    
        await MyApp.getFolders(true);
        
    } else {
        
        const MyApp = new App({auth_email : promptResult.user, auth_password : promptResult.password});

        await MyApp.authenticate();

        const links = await MyApp.getSpUrls();

        console.log("Links retornados:", links)
    
    }
})()