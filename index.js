import prompt from "prompt";
import minimist from "minimist";
import colors from "@colors/colors/safe.js";
import App from "./src/app.js";

(async () => {
    // Clear Terminal
    process.stdout.write('\x1Bc'); 

    console.log("Insira as informações: \n");

    const schema = {
        properties: {
            url: {
                description: colors.white("Insira a url ") + colors.white("(opcional)"),
                required: false,
            },
            user: {
                description: colors.white("Insira um usuário ") + colors.red.bold("(obrigatório)"),
                message: "Usúario não inserido, insira um usuário ou saia do processo usando Ctrl + C",
                required: true,
            },
            password: {
                description: colors.white("Insira a senha ") + colors.red.bold("(obrigatório)"),
                message: "Senha não inserida, insira uma senha ou saia do processo usando Ctrl + C",
                hidden: true,
                required: true,
                replace: "*",
            }
        }
    }

    prompt.start();
    prompt.message = ""

    let argv = minimist(process.argv.slice(2));

    Object.entries(argv).length != 1 ? (prompt.override = argv, argv.url ? null : delete schema.properties.url) : null ;

    const promptResult = await prompt.get(schema);

    promptResult.url == "" ? delete promptResult.url : null;

    if(promptResult.hasOwnProperty("url")) {
        const MyApp = new App({sp_url : promptResult.url, auth_email : promptResult.user, auth_password : promptResult.password});
    
        await MyApp.authenticate();
    
        await MyApp.getFolders();
    
        // await MyApp.requestFile();

    } else {
        const MyApp = new App({auth_email : promptResult.user, auth_password : promptResult.password});

        await MyApp.authenticate();

        const links = await MyApp.getSpUrls();

        console.log("Links retornados:", links)
    }

})()