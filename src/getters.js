import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import fs from "fs";
import yaml from "js-yaml";

export const getAbsolutePaths = () => {
    /**
     * Get all the required files absolute paths
     */
  
    return {
        workspacePath: resolve("workspace"),
        outputPath: resolve("workspace/output"),
        optionsPath: resolve("workspace/options.yml"),
        templatePath: resolve("workspace/template.txt"),
    };
};

export const getTemplate = () => {
    /**
     * Get the template file as a raw string
     */

    const paths = getAbsolutePaths();
    const r_template = fs.readFileSync(paths.templatePath, "utf8");
    return r_template;
};

export const getTime = () => {
    /**
     * Get current time as a localeString
     */
  
    const currDatetime = new Date();
    return currDatetime.toLocaleString();
};

export const getOptions = () => {
    /**
     * Get the options as a JS object from the options file
     */

    const paths = getAbsolutePaths();
    const options = yaml.load(fs.readFileSync(paths.optionsPath, "utf8"));
    return options;
};

export const getTags = () => {
    /**
     * Get all the tags raw the template file
     */
  
    const paths = getAbsolutePaths();
    const r_template = fs.readFileSync(paths.templatePath, "utf8");
    const template_arr = r_template.split(" }}");
    const all_tags = template_arr.map((x) => {
      return x.split("{{ ")[1];
    });
    const tags_raw = all_tags.slice(0, -1);
    return tags_raw;
  };