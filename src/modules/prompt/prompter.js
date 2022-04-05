import prompt from "prompt";
import minimist from "minimist";
import colors from "@colors/colors/safe.js";

export default class Prompter {
    async build(forDownload = false) {
        // Clear Terminal
        process.stdout.write('\x1Bc');

        console.log("Insira as informações: \n");

        const schema = {
            properties: {
                url: {
                    description: colors.white("Insira a url ") + (forDownload ? colors.red.bold("(obrigatório)") : colors.white("(opcional)")),
                    required: forDownload,
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

        forDownload ? schema.properties.url.message = "Url não inserido, insira uma Url ou saia do processo usando Ctrl + C" : null

        prompt.start();
        prompt.message = ""

        let argv = minimist(process.argv.slice(2));

        if (Object.entries(argv).length != 1) {
            prompt.override = argv
            if (forDownload == false) {
                argv.url ? null : delete schema.properties.url
            }
        }

        const promptResult = await prompt.get(schema);

        promptResult.url == "" ? delete promptResult.url : null;

        return promptResult
    }
}