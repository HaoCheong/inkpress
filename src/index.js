
import figlet from "figlet";

import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import fs from "fs";


import {
    inputConcat,
    inputTitle,
    inputContinue,
    repeatedChoice,
    selectRandomChoice
} from "./inputs.js"

import {
    getAbsolutePaths,
    getTime,
    getOptions,
    getTags,
} from "./getters.js"

import {
  validatePrestart,
  validateWorkspace
} from "./validators.js"

import {
  checkReqFiles,
  display,
  generateRecentWriting,
  parseTags,
  saveWriting
} from "./helpers.js"

const init = () => {
    /**
     * Initialisation of workspace
     */
  
    if (process.argv[2] === "init") {
        if (checkReqFiles()) {
            console.log(`
            Required files already exist
            To run inky, run the command:
                inky
                `);
            process.exit(1);
        }
        const paths = getAbsolutePaths();
        const defaultOptions = resolve(__dirname, `./_default/options.yml`);
        const defaultTemplate = resolve(__dirname, `./_default/template.txt`);
        fs.mkdirSync(paths.workspacePath);
        fs.mkdirSync(paths.outputPath);
        fs.writeFileSync(paths.optionsPath, "");
        fs.writeFileSync(paths.templatePath, "");
        fs.copyFileSync(defaultOptions, paths.optionsPath);
        fs.copyFileSync(defaultTemplate, paths.templatePath);

        const msg = `Inky <:E`;
        console.log(figlet.textSync(msg));

        console.log(`
        Initialise complete: options.yml and template.txt added to workspace
        To begin, run the command:
            inky
            `);
        process.exit(0);
    }
};






  










  


const main = async () => {

    // Initialisation check
    await init()

    // Validation of prestart files
    validatePrestart() 
  
    // Get and check input of potential work space
    let meta = { title: "", continue: true, concat: false };
    meta.title = await inputTitle();
    let options = getOptions();
    let tags = getTags();

    validateWorkspace(options, tags, meta);

    meta.concat = await inputConcat();
    while (meta.continue) {

        let responses = [];
        while (tags.length > 0) {
            let tag_counter = 0;
            

            let curr_writing = generateRecentWriting(responses);
            display(curr_writing, meta);

            const curr_tag_raw = tags[tag_counter];
            const curr_tag_obj = parseTags(curr_tag_raw);

            // Check special tags
            switch (curr_tag_obj.option) {
                case "_time":
                    let answer = getTime();
                    responses.push(answer);
                    tags.shift();
                    tag_counter += 1;
                    continue
            }

            // Check tag options
            let resp = ""
            switch (curr_tag_obj.type) {
                case "-r":
                    resp = selectRandomChoice(options[curr_tag_obj.option]);
                    break;
                case "-l":
                    //Repeated input
                    resp = await repeatedChoice(options, curr_tag_obj, curr_tag_obj.args[0], responses, meta)
                    break
                default:
                    //Single Choice
                    resp = await repeatedChoice(options, curr_tag_obj, 1, responses, meta)
                    break
            }
            responses.push(resp)
            tags.shift();
            tag_counter += 1;

            curr_writing = generateRecentWriting(responses);
            display(curr_writing, meta);
        }

        await saveWriting(meta.title, meta.concat, responses);
        options = getOptions();
        tags = getTags();

        meta.continue = await inputContinue()
        if (!meta.concat && meta.continue) {
          meta.title = await inputTitle();
        }
    }
}

main()
