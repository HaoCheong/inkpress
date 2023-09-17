#!/usr/bin/env node

// Animation Imports
import chalk from "chalk";
import inquirer from "inquirer";
import gradient from 'gradient-string';
import chalkAnimation from "chalk-animation";
import figlet from 'figlet';

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const specialTags = ['_time', '_manual']

import fs, { existsSync } from 'fs'
import yaml from 'js-yaml'
import { exit } from "process";

// TODO - Checks if an option file and template file have been generated

// TODO - Process options
const getOptions = () => {
    const options_path = resolve(__dirname, 'workspace/options.yml')
    const options = yaml.load(fs.readFileSync(options_path, 'utf8'))
    return options
}

const processTags = (tag) => {
    const tag_details = tag.split(" ")
    return {
        option: tag_details[0],
        type: tag_details[1],
        args: tag_details.slice(2)
    }
}

const getTags = () => {
    const template_path = resolve(__dirname, 'workspace/template.txt')
    const r_template = fs.readFileSync(template_path, 'utf8');
    const template_arr = r_template.split(' }}')
    const all_tags = template_arr.map((x) => {
        return x.split('{{ ')[1]
    })
    const tags_raw = all_tags.slice(0,-1)
    return tags_raw
}

const getTitle = async () => {
    // Each instance will take in a title
    const details = await inquirer.prompt({
        name: 'title',
        type: 'input',
        message: 'Title: '
    })
    return details.title
}

const inputConcat = async () => {
    const res = await inquirer.prompt({
        name: 'concat',
        type: 'list',
        message: 'Concatenate in one file? ',
        choices: ["Yes", "No"],
    })
    return res.concat === "Yes"
}

const getTemplate = async () => {
    const template_path = resolve(__dirname, 'workspace/template.txt')
    const r_template = fs.readFileSync(template_path, 'utf8');
    return r_template
}


const getRecentWriting = async (responses) => {
    // Get the most recent filled out writing
    let template = await getTemplate()
    const all_tags = getTags()

    for (let i = 0; i < responses.length; ++i) {
        template = template.replace(`{{ ${all_tags[i]} }}`, responses[i])
    }
    return template
}

const manualInput = async () => {
    const details = await inquirer.prompt({
        name: 'manualPrompt',
        type: 'input',
        message: 'Manual Input:'
    })
    return details.manualPrompt
}

const getRandom = (choices) => {
    console.log("CHOICE", choices)
    const index = Math.floor(Math.random() * choices.length)
    return choices[index]
}

const handleResponse = async (answer, choices) => {
    if (answer === "RANDOM") {
        return getRandom(choices)
    } else if (answer === "MANUAL INPUT") {
        return await manualInput()
    } else {
        return answer
    }
}

const promptContinue = async () => {
    const res = await inquirer.prompt({
        name: 'continue',
        type: 'list',
        message: 'Continue writing? ',
        choices: ["Yes", "No"],
    })
    return res.continue === "Yes"
}

const saveWriting = async (title, concat) => {

    /**
     * Save writing to a file (Title: title.txt)
     */

    const new_page_path = resolve(__dirname, `workspace/output/${title}.txt`)
    const content = await getRecentWriting(responses)

    if (!fs.existsSync(new_page_path)) {
        fs.writeFileSync(new_page_path, '')
    }
    
    if (concat) {
        console.log(chalk.bgGreen(` +++ Appending to "${new_page_path}" +++ \n`))
        fs.appendFileSync(new_page_path, `\n${content}`)
    } else {
        console.log(chalk.bgGreen(` +++ Saving to "${new_page_path}" +++ \n`))
        fs.writeFileSync(new_page_path, content)
    }
    
}

const inputAnswers = async (options) => {

    /**
     * Selector of choices
     */

    const choices = options.concat(["", "RANDOM", "MANUAL INPUT", "CLEAR"])
    const question = await inquirer.prompt({
        name: 'answer',
        type: 'list',
        message: 'INPUT: ',
        choices: choices,
    })
    return question.answer
}

const getTime = () => {

    /**
     * Get current time as a localeString
     */

    const currDatetime = new Date()
    return currDatetime.toLocaleString()
}

const inputMulti = async (options, curr_tag_obj, answer) => {

    /**
     * Recursive input for multiple of the same tag
     */

    const delim = curr_tag_obj.args[1]
    let next_answer = ""
    let new_answer = ""

    for (let i = curr_tag_obj.args[0]; i !== 0; i--){

        switch (curr_tag_obj.option) {
            case "_manual":
                next_answer = await manualInput()
                break
            default:
                next_answer = await inputAnswers(options[curr_tag_obj.option].concat(['','DONE']))
                break
        }

        

        if (next_answer === "DONE") {
            return new_answer
        }
        
        if (delim === "\\n") {
            new_answer = `${new_answer} \n ${next_answer}`
        } else {
            new_answer = `${new_answer} ${delim} ${next_answer}`
        }

        const new_response = [...responses, new_answer]
        const curr_writing = await getRecentWriting(new_response)
        display(curr_writing)
        
        if (i < 0) {
            console.log(chalk.yellow("Select DONE or continue adding\n"))
        } else {
            console.log(`Remaining: ${chalk.yellow(i)}\n`)
        }


    }

    return new_answer
    
}

const runThrough = async () => {

    /**
     * Runs through all the tags
    */

    const curr_writing = await getRecentWriting(responses)
    await display(curr_writing)
    if (tags.length === 0) {
        return
    }
    const curr_tag_raw = tags[0]
    const curr_tag_obj = processTags(curr_tag_raw)
    let answer = ""

    // Special case tags check
    switch (curr_tag_obj.option) {
        case "_time":
            answer = getTime()
            break
        case "_manual":
            answer = await manualInput()
            break
    }

    // Check type if no answer
    if (answer === "") {
        switch (curr_tag_obj.type) {
            case "-r":
                answer = getRandom(options[curr_tag_obj.option])
                break
            case "-l":
                answer = await inputMulti(options, curr_tag_obj, answer)
                break
            default:
                answer = await inputAnswers(options[curr_tag_obj.option])
                break
        }
    }

    if (answer === "") {
        await runThrough()
    }

    const response = await handleResponse(answer)
    responses.push(response)
    tags.shift()

    await runThrough()
}

const display = async (writing) => {
    // Display the current outputs
    console.clear()
    console.log(`${chalk.bold("Title")}: ${meta.title}`)
    console.log(chalk.bgWhite('<<<<<<<<<<<<<<<<<<<< CURRENT >>>>>>>>>>>>>>>>>>>>\n'))
    console.log(`${writing}\n`)
    console.log(chalk.bgWhite('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n'))
}

const checkReqFiles = () => {
    /**
     * Check if the files exist
    */
    const options_path = resolve(__dirname, 'workspace/options.yml')
    const template_path = resolve(__dirname, 'workspace/template.txt')

    if (!fs.existsSync(options_path) || !fs.existsSync(template_path)) {
        return false
    }
    return true
}

const init = () => {
    /**
     * Initialisation
     */

    if (process.argv[2] === "init") {
        const workspace_path = resolve(__dirname, 'workspace')
        const output_path = resolve(__dirname, 'workspace/output')
        const options_path = resolve(__dirname, 'workspace/options.yml')
        const template_path = resolve(__dirname, 'workspace/template.txt')
        if (checkReqFiles()) {
            console.log(`
Required files already exist
To run inky, run the command:
    inky
            `)
            exit(1)
        }
        fs.mkdirSync(workspace_path);
        fs.mkdirSync(output_path);
        fs.writeFileSync(options_path, "")
        fs.writeFileSync(template_path, "")

        const msg = `Inky <:E`

        console.log(
            figlet.textSync(msg)
        );

        console.log(`
Initialise complete: options.yml and template.txt added to workspace
To begin, run the command:
    inky
        `);
        exit(0)
    }
}

const tagsDiff = (options, tags) => {
    /**
     * Return the difference in tags between options on template files
     */
    
    const optionKeys = Object.keys(options).sort()

    //Get a set of tags removing dupes
    const allTags = [... new Set(tags.map((tag) => { return tag.split(" ")[0]}))].sort()

    //Filter out any special tags
    const tagOptions = allTags.filter(tag => !specialTags.includes(tag))

    //Get the difference between tagOption and optionKeys
    const diff = tagOptions.filter(tag => !optionKeys.includes(tag));
    return diff
}


// ========== Pre-start ==========

// Create files when added an init
await init()

// TODO - Check for requisite files
if (!checkReqFiles()) {
    console.error(`
Unable to find required files
Please initialise the workspace using the command:
    inky init
        `)
    exit(1)
}

// Get options and tags
let options = getOptions()
let tags = getTags()

// Validate options and tags
const validateWorkspace = tagsDiff(options, tags)
if (validateWorkspace.length > 0) {
    console.error(`
Template contain unrecognisable tags:
Tags: ${validateWorkspace.join(" ")}
    `)
    exit(1)
}


// ========== Running ==========
let responses = []
const meta = {title: "", continue: true, concat: false}

meta.title = await getTitle()
meta.concat = await inputConcat()

while (meta.continue) {

    await runThrough()
    await saveWriting(meta.title, meta.concat)

    responses = []
    options = getOptions()
    tags = getTags()
    
    meta.continue = await promptContinue()
    if (meta.continue && !meta.concat) {
        meta.title = await getTitle()
    }
}

// ========== Post ==========


/** EXTRA
 * TODO - Create a validate function to validate all files (Add no tagless templates)
 * TODO - Move all input prompts to inputs.js
 * TODO - Rename all inputs into input<prompt>() instead
 * TODO - Move all basic getters into getters
 * TODO - Add JS Docs to all of them
 * TODO - Convert all snake case to camel case
 */