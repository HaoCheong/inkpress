import { getTags, getTemplate } from "./getters.js";
import { inputManual } from "./inputs.js";
import chalk from "chalk";
const specialTags = ["_time", "_manual"];

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

export const selectRandomChoice = (choices) => {
  /**
   * Get a random answer from the given option list
   */

  const index = Math.floor(Math.random() * choices.length);
  return choices[index];
};

export const handleResponse = async (answer, choices) => {
  if (answer === "RANDOM") {
    return selectRandomChoice(choices);
  } else if (answer === "MANUAL INPUT") {
    return await inputManual();
  } else {
    return answer;
  }
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
