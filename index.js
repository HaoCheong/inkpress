#!/usr/bin/env node

// Animation Imports
import chalk from "chalk";
import inquirer from "inquirer";
import gradient from 'gradient-string';
import chalkAnimation from "chalk-animation";
import figlet from 'figlet';



import fs from 'fs'
import yaml from 'js-yaml'

// TODO - Checks if an option file and template file have been generated

// TODO - Process options

const getOptions = () => {
    const optionPath = './options.yml'
    const options = yaml.load(fs.readFileSync(optionPath, 'utf8'))
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
    const templatePath = './template.txt'
    const r_template = fs.readFileSync(templatePath, 'utf8');
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
    const templatePath = './template.txt'
    const r_template = fs.readFileSync(templatePath, 'utf8');
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

const options = getOptions()
const tags = getTags()
const responses = []
const meta = {"Title": ""}

meta.title = await getTitle()
await runThrough()