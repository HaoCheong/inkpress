import { getAbsolutePaths } from "./getters.js";
import { diffTags } from "./helpers.js";
import fs from "fs";
import { exit } from "node:process";

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

export const validatePrestart = () => {
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

export const validateWorkspace = (options, tags, meta) => {
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
