import chalk from "chalk";
import inquirer from "inquirer";
import { generateRecentWriting, display, handleResponse } from "./helpers.js";

export const inputTitle = async () => {
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

export const inputContinue = async () => {
  /**
   * Get the user's continue prompt
   */

  const res = await inquirer.prompt({
    name: "continue",
    type: "list",
    message: "Continue writing? ",
    choices: ["Yes", "No"],
  });
  return res.continue === "Yes";
};

export const inputAnswers = async (options) => {
  /**
   * Selector of choices
   */

  const choices = options.concat(["", "RANDOM", "MANUAL INPUT"]);
  const question = await inquirer.prompt({
    name: "answer",
    type: "list",
    message: "INPUT: ",
    choices: choices,
  });
  return question.answer;
};

export const inputMulti = async (options, curr_tag_obj, meta, responses) => {
  /**
   * Iterative input for multiple of the same tag
   */

  const delim = curr_tag_obj.args[1];
  let next_answer = "";
  let new_answer = "";

  for (let i = curr_tag_obj.args[0]; i !== 0; i--) {
    switch (curr_tag_obj.option) {
      case "_manual":
        next_answer = await inputManual();
        break;
      default:
        next_answer = await inputAnswers(
          options[curr_tag_obj.option].concat(["", "DONE"])
        );
        break;
    }

    if (next_answer === "DONE") {
      return new_answer;
    }

    new_answer = await handleResponse(new_answer, options[curr_tag_obj.option]);

    if (delim === "\\n") {
      new_answer = `${new_answer} \n ${next_answer}`;
    } else {
      new_answer = `${new_answer} ${delim} ${next_answer}`;
    }

    const new_response = [...responses, new_answer];
    const curr_writing = await generateRecentWriting(new_response);
    display(curr_writing, meta);

    if (i < 0) {
      console.log(chalk.yellow("Select DONE or continue adding\n"));
    } else {
      console.log(`Remaining: ${chalk.yellow(i - 1)}\n`);
    }
  }

  return new_answer;
};
