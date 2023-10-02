import chalk from "chalk";
import inquirer from "inquirer";
import gradient from "gradient-string";
import chalkAnimation from "chalk-animation";
import figlet from "figlet";

import { fileURLToPath } from "url";
import { delimiter, dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import fs from "fs";
import yaml from "js-yaml";

const specialTags = ["_time", "_manual"];

export const inputConcat = async () => {
    /**
     * Prompt for concatenating values into one file
     */
  
    const res = await inquirer.prompt({
      name: "concat",
      type: "list",
      message: "Concatenate in one file? ",
      choices: ["Yes", "No"],
    });
    return res.concat === "Yes";
  };

const display = (writing, meta) => {
    /**
     * Display content in a terminal box
     */
  
    console.clear();
    console.log(`${chalk.bold("Title")}: ${meta.title}`);
    console.log(
      chalk.bgBlue("<<<<<<<<<<<<<<<<<<<< CURRENT >>>>>>>>>>>>>>>>>>>>\n")
    );
    console.log(`${writing}\n`);
    console.log(
      chalk.bgBlue("<<<<<<<<<<<<<<<<<<<<<< END >>>>>>>>>>>>>>>>>>>>>>\n")
    );
};

export const getTemplate = () => {
    /**
     * Get the template file as a raw string
     */
    const paths = getAbsolutePaths();
    const r_template = fs.readFileSync(paths.templatePath, "utf8");
    return r_template;
  };

const generateRecentWriting = (responses) => {
    /**
     * Given the responses, generate the writing via tag replacement
     */

    console.log("asdashdkasasqwd", responses)
  
    let template = getTemplate();
    const all_tags = getTags();
  
    for (let i = 0; i < responses.length; ++i) {
      template = template.replace(`{{ ${all_tags[i]} }}`, responses[i]);
    }
    return template;
};

export const getAbsolutePaths = () => {
    /**
     * Get all the required files absolute paths
     */
  
    return {
      workspacePath: resolve(__dirname, "../workspace"),
      outputPath: resolve(__dirname, "../workspace/output"),
      optionsPath: resolve(__dirname, "../workspace/options.yml"),
      templatePath: resolve(__dirname, "../workspace/template.txt"),
    };
};

export const checkReqFiles = () => {
    /**
     * Check if all the required files exist
     */
    const paths = getAbsolutePaths();
    return (
        fs.existsSync(paths.workspacePath) &&
        fs.existsSync(paths.outputPath) &&
        fs.existsSync(paths.optionsPath) &&
        fs.existsSync(paths.templatePath)
    );
};

  
const validatePrestart = () => {
/**
 * Validate the requirements after prestart
 */

//Check if all the required files exist
if (!checkReqFiles()) {
    console.error(`
        Unable to find required files
        Please initialise the workspace using the command:
            inky init
        `);
    exit(1);
}
};

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
            exit(1);
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
        exit(0);
    }
};

const validateWorkspace = (options, tags, meta) => {
    /**
     * Validate the requires after tag and template processing
     */
  
    const paths = getAbsolutePaths();
  
    if (meta.title === "") {
      console.error(`
    Title cannot be empty string
        `);
      exit(1);
    }
  
    if (tags.length < 1) {
      console.error(`
    Empty template detected, add tags into "${paths.templatePath}" to continue
        `);
      exit(1);
    }
  
    Object.keys(options).forEach((key) => {
      if (options[key].length < 1) {
        console.error(`
    Empty options detected, please add options into "${paths.optionsPath} to continue"
          `);
        exit(1);
      }
    });
  
    if (diffTags(options, tags).length > 0) {
      console.error(`
    Template contain unrecognisable tags:
    Tags: ${validateWorkspace.join(" ")}
        `);
      exit(1);
    }
};

const diffTags = (options, tags) => {
    /**
     * Return the difference in tags between options on template files
     */
  
    const optionKeys = Object.keys(options).sort();
  
    //Get a set of tags removing dupes
    const allTags = [
      ...new Set(
        tags.map((tag) => {
          return tag.split(" ")[0];
        })
      ),
    ].sort();
  
    //Filter out any special tags
    const tagOptions = allTags.filter((tag) => !specialTags.includes(tag));
  
    //Get the difference between tagOption and optionKeys
    const diff = tagOptions.filter((tag) => !optionKeys.includes(tag));
    return diff;
};

const runThrough = async () => {

    let responses = [];

    const curr_writing = generateRecentWriting(responses);
    display(curr_writing, meta);

}

const parseTags = (tag) => {
    /**
     * Converts raw tags into a tag object
     */
  
    const tag_details = tag.split(" ");
    return {
      option: tag_details[0],
      type: tag_details[1],
      args: tag_details.slice(2),
    };
};

export const inputManual = async () => {
    /**
     * Get the user's manual user input
     */
  
    const details = await inquirer.prompt({
        name: "manualPrompt",
        type: "input",
        message: "Manual Input:",
    });
    return details.manualPrompt;
};

const inputAnswers = async (options) => {
    /**
     * Selector of choices
     */
  
    if (options === undefined) {
      return ""
    }
  
    const choices = options.concat(["", "RANDOM", "MANUAL INPUT", ""]);
    const question = await inquirer.prompt({
        name: "answer",
        type: "list",
        message: "INPUT: ",
        choices: choices,
    });

    if (question.answer === "RANDOM") {
        return selectRandomChoice(options);
    } else if (question.answer === "MANUAL INPUT") {
        return inputManual()
    }

    return question.answer;
    
};
  

const checkResponse = (resp) => {
    if (resp === "") {
        console.error("Response cannot be empty")
        return false
    }
    return true

}

export const getTime = () => {
    /**
     * Get current time as a localeString
     */
  
    const currDatetime = new Date();
    return currDatetime.toLocaleString();
  };

const repeatedChoice = async (options, curr_tag_obj, repeatCount, responses, meta) => {
    
    let resp_arr = []
    let counter = repeatCount
    let resp = ""
    let delim = ""

    if (curr_tag_obj.type !== undefined) {
        delim = curr_tag_obj.args[1]
        if (delim === "\\n") {
            delim = "\n"
        } else {
            delim = ` ${delim} `
        }
    }

    let curr_resp = ""
    while (counter !== 0) {

        if (curr_tag_obj.option === "_manual") {
            curr_resp = await inputManual();
        } else {
            curr_resp = await inputAnswers(options[curr_tag_obj.option].concat(["", "DONE"])) 
        }

        if (curr_resp === "DONE") {
            break
        }

        if (curr_resp !== "") {
            resp_arr.push(curr_resp)
            counter -= 1
        }

        let temp_resp = resp_arr.join(delim)
        let temp_responses = [...responses]
        temp_responses.push(temp_resp)
        let temp_writing = generateRecentWriting(temp_responses)
        console.log("TEMPO", temp_writing)
        display(temp_writing, meta)

    }
    resp = resp_arr.join(delim)
    return resp

}

const inputTitle = async () => {
  /**
   * Prompt getting the title of the current run through
   */

  const details = await inquirer.prompt({
        name: "title",
        type: "input",
        message: "Title: ",
    });
    return details.title;
};

const getOptions = () => {
    /**
     * Get the options as a JS object from the options file
     */
    const paths = getAbsolutePaths();
    const options = yaml.load(fs.readFileSync(paths.optionsPath, "utf8"));
    return options;
  };

  const getTags = () => {
    /**
     * Get all the tags raw the template file
     */
  
    const paths = getAbsolutePaths();
    const r_template = fs.readFileSync(paths.templatePath, "utf8");
    const template_arr = r_template.split(" }}");
    const all_tags = template_arr.map((x) => {
      return x.split("{{ ")[1];
    });
    const tags_raw = all_tags.slice(0, -1);
    return tags_raw;
  };

export const selectRandomChoice = (choices) => {
/**
 * Get a random answer from the given option list
 */

const index = Math.floor(Math.random() * choices.length);
return choices[index];
};

const saveWriting = async (title, concat, responses) => {
    /**
     * Save writing to a file (Title: title.txt)
     */
  
    const new_page_path = resolve(__dirname, `../workspace/output/${title}.txt`);
    const content = await generateRecentWriting(responses);
  
    if (!fs.existsSync(new_page_path)) {
      fs.writeFileSync(new_page_path, "");
    }
  
    if (concat) {
      console.log(chalk.bgGreen(` +++ Appending to "${new_page_path}" +++ \n`));
      fs.appendFileSync(new_page_path, `\n${content}`);
    } else {
      console.log(chalk.bgGreen(` +++ Saving to "${new_page_path}" +++ \n`));
      fs.writeFileSync(new_page_path, content);
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
    }
}

main()