import {
    getAbsolutePaths,
} from "./getters.js"

import {
  checkReqFiles,
  diffTags,
} from "./helpers.js"

export const validateWorkspace = (options, tags, meta) => {
    /**
     * Validate the requires after tag and template processing
     */
  
    const paths = getAbsolutePaths();
  
    if (meta.title === "") {
      console.error(`
    Title cannot be empty string
        `);
      process.exit(1);
    }
  
    if (tags.length < 1) {
      console.error(`
    Empty template detected, add tags into "${paths.templatePath}" to continue
        `);
      process.exit(1);
    }
  
    Object.keys(options).forEach((key) => {
      if (options[key].length < 1) {
        console.error(`
    Empty options detected, please add options into "${paths.optionsPath} to continue"
          `);
        process.exit(1);
      }
    });
  
    if (diffTags(options, tags).length > 0) {
      console.error(`
    Template contain unrecognisable tags:
    Tags: ${validateWorkspace.join(" ")}
        `);
      process.exit(1);
    }
};

export const validatePrestart = () => {
    /**
     * Validate the requirements after prestart
     */
    
    if (!checkReqFiles()) {
        console.error(`
            Unable to find required files
            Please initialise the workspace using the command:
                inky init
            `);
        process.exit(1);
    }
};
