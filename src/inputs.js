import inquirer from "inquirer";
import chalk from "chalk";

import {
  display,
  generateRecentWriting,
} from "./helpers.js"

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

export const inputAnswers = async (options) => {
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

export const repeatedChoice = async (options, curr_tag_obj, repeatCount, responses, meta) => {

    /**
     * Get user inputs and choices, will repeat X amount of times depending on option
     */

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

        //Display the remaining count counter
        if (counter > 0) {
            console.log(chalk.yellow(`Remaining Inputs: ${counter}`))
            console.log(chalk.yellow(`Select or type DONE if you wanna end early\n`))
        } else {
            console.log(chalk.yellow("Select or type DONE when you are done selection\n"))
        }

        // Checks the type for the tag
        if (curr_tag_obj.option === "_manual") {
            curr_resp = await inputManual();
        } else {
            curr_resp = await inputAnswers(options[curr_tag_obj.option].concat(["", "DONE"])) 
        }

        // Break case for infinite looping
        if (curr_resp === "DONE") {
            break
        }

        //Rejection options for empty input
        if (curr_resp !== "") {
            resp_arr.push(curr_resp)
            counter -= 1
        }

        // Temporary display for concat values until confirmed
        let temp_resp = resp_arr.join(delim)
        let temp_responses = [...responses]
        temp_responses.push(temp_resp)
        let temp_writing = generateRecentWriting(temp_responses)
        display(temp_writing, meta)
    }

    resp = resp_arr.join(delim)
    return resp

}

export const selectRandomChoice = (choices) => {
    /**
     * Get a random answer from the given option list
     */
    
    const index = Math.floor(Math.random() * choices.length);
    return choices[index];
};
    