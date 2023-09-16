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

const getTemplate = async () => {
    const template_path = resolve(__dirname, 'workspace/template.txt')
    const r_template = fs.readFileSync(template_path, 'utf8');
    return r_template
}


const getRecentWriting = async () => {
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

const handleResponse = async (answer, choices) => {
    if (answer === "RANDOM") {
        const index = Math.floor(Math.random() * choices.length)
        return choices[index]
    } else if (answer === "MANUAL INPUT") {
        return await manualInput()
    } else {
        return answer
    }
}

const promptContinue = async () => {

}

const runThrough = async () => {
    //Runs through all the tags
    await display()
    if (tags.length === 0) {
        return
    }
    const curr_tag_raw = tags[0]
    const curr_tag_obj = processTags(curr_tag_raw)
    const choices = options[curr_tag_obj.option].concat(["", "RANDOM", "MANUAL INPUT", "CLEAR"])
    const question = await inquirer.prompt({
        name: 'answer',
        type: 'list',
        message: 'Input: ',
        choices: choices,
    })
    if (question.answer === "") {
        await runThrough()
    }
    const response = await handleResponse(question.answer, options[curr_tag_obj.option])
    responses.push(response)
    tags.shift()

    await runThrough()
}

const display = async () => {
    // Display the current outputs
    console.clear()
    const writing = await getRecentWriting()
    console.log(`${chalk.bold("Title")}: ${meta.title}`)
    console.log(chalk.bgWhite('<<<<<<<<<<<<<<<<<<<< CURRENT >>>>>>>>>>>>>>>>>>>>\n'))
    console.log(`${writing}\n`)
    console.log(chalk.bgWhite('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n'))
}

const checkReqFiles = () => {
    // Check if the files exist
    const options_path = resolve(__dirname, 'workspace/options.yml')
    const template_path = resolve(__dirname, 'workspace/template.txt')

    if (!fs.existsSync(options_path) || !fs.existsSync(template_path)) {
        return false
    }
    return true
}

const init = () => {
    if (process.argv[2] === "init") {
        const workspace_path = resolve(__dirname, 'workspace')
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

const workspaceDiff = (options, tags) => {
    const optionKeys = Object.keys(options).sort()
    const tagOptions = [... new Set(tags.map((tag) => { return tag.split(" ")[0]}))].sort()
    const diff = tagOptions.filter(tag => !optionKeys.includes(tag));
    return diff
    // return tagOptions.every(val => optionKeys.includes(val));
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
const options = getOptions()
const tags = getTags()

// Validate options and tags
const validateWorkspace = workspaceDiff(options, tags)
if (validateWorkspace.length > 0) {
    console.error(`
Template contain unrecognisable tags:
Tags: ${validateWorkspace.join(" ")}
    `)
}

// ========== Running ==========
const responses = []
const meta = {"Title": ""}

meta.title = await getTitle()
await runThrough()

// ========== Post ==========


