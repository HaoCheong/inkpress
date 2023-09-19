#!/usr/bin/env node

// Animation Imports
import chalk from "chalk";
import inquirer from "inquirer";
import gradient from "gradient-string";
import chalkAnimation from "chalk-animation";
import figlet from "figlet";

import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import fs from "fs";

import {
  getOptions,
  getTags,
  getAbsolutePaths,
  getTemplate,
  getTime,
} from "./getters.js";

import {
  inputTitle,
  inputConcat,
  inputManual,
  inputContinue,
  inputAnswers,
  inputMulti,
} from "./inputs.js";

import {
  generateRecentWriting,
  selectRandomChoice,
  diffTags,
  parseTags,
  display,
  handleResponse,
} from "./helpers.js";

import {
  checkReqFiles,
  validateWorkspace,
  validatePrestart,
} from "./validators.js";

import { exit } from "process";

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

const runThrough = async (options, tags, meta) => {
  /**
   * Runs through all the tags and append to responses
   */

  console.log(options);
  console.log(tags);

  let responses = [];

  while (tags.length > 0) {
    let tag_counter = 0;
    const curr_tag_raw = tags[tag_counter];
    const curr_tag_obj = parseTags(curr_tag_raw);

    // Show current writing
    const curr_writing = generateRecentWriting(responses);
    display(curr_writing, meta);

    let answer = "";

    // Special case tags check
    switch (curr_tag_obj.option) {
      case "_time":
        answer = getTime();
        break;
      case "_manual":
        answer = await inputManual();
        break;
    }
    console.log("answer", answer)

    // Check tag types
    if (answer === "") {
      switch (curr_tag_obj.type) {
        case "-r":
          answer = selectRandomChoice(options[curr_tag_obj.option]);
          break;
        case "-l":
          answer = await inputMulti(options, curr_tag_obj, meta, responses);
          break;
        default:
          console.log("HERE 3", curr_tag_obj, options, options[curr_tag_obj.option])
          answer = await inputAnswers(options[curr_tag_obj.option]);
          break;
      }
    }

    console.log("answer 2", answer)
    if (answer === "") {
      continue;
    }

    const response = await handleResponse(answer);
    responses.push(response);
    tags.shift();
    tag_counter += 1;
  }

  await saveWriting(meta.title, meta.concat, responses);
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

// ========== Pre-start ==========

const main = async () => {
  // ========== PRESTART ===========

  // Create files when added an init
  await init();

  // Check all required files and directories exist
  validatePrestart();

  // ========== TAG & TEMPLATE PROCESSING ==========

  // Get options available and get tags
  let options = getOptions();
  let tags = getTags();

  // Initial meta values setup
  const meta = { title: "", continue: true, concat: false };
  meta.title = await inputTitle();
  meta.concat = await inputConcat();

  validateWorkspace(options, tags, meta);

  // ========== RUN THROUGH ==========
  while (meta.continue) {
    //Run through all tags
    await runThrough(options, tags, meta);

    //Reset all values
    options = getOptions();
    tags = getTags();

    //Get continue
    meta.continue = await inputContinue();

    //Overwrite title for new files
    if (meta.continue && !meta.concat) {
      meta.title = await inputTitle();
    }
  }
};

await main();

// ========== Post ==========

/** EXTRA
 * TODO - Create a validate function to validate all files (Add no tagless templates)
 * TODO - Move all input prompts to inputs.js
 * TODO - Rename all inputs into input<prompt>() instead
 * TODO - Move all basic getters into getters
 * TODO - Add JS Docs to all of them
 * TODO - Convert all snake case to camel case
 */
