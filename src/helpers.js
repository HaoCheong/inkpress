import chalk from "chalk";

import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import fs from "fs";

const specialTags = ["_time", "_manual"];

import {
    getAbsolutePaths,
    getTemplate,
    getTags,
} from "./getters.js"

export const display = (writing, meta) => {
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

export const generateRecentWriting = (responses) => {
    /**
     * Given the responses, generate the writing via tag replacement
     */

    let template = getTemplate();
    const all_tags = getTags();
  
    for (let i = 0; i < responses.length; ++i) {
      template = template.replace(`{{ ${all_tags[i]} }}`, responses[i]);
    }
    return template;
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

export const diffTags = (options, tags) => {
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


export const parseTags = (tag) => {
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

export const checkResponse = (resp) => {
    if (resp === "") {
        console.error("Response cannot be empty")
        return false
    }
    return true
}


export const saveWriting = async (title, concat, responses) => {
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