# Inky - The Quick Templater CLI tool 🦑

Inky is a node-based CLI tool allowing you to quickyl generate files of a repetitive structure and answers.

Use cases include (but are not limited to):

- Marking for educators
- Invitations
- Personalised emails to large groups
- Testing data
- Writing standard readmes

## Installation

<!-- TODO -->

## Running

To initialise the workspace and the default templates and options, run the following command:

```bash
inky init
```

This will create a directories and files:

- `workspace/`: Where everything related to inky is created
- `workspace/output`: Where all your generated content goes
- `options.yml`: Yaml file containing all your tags and selection. Comes with same selections and tags
- `template.txt`: The Template file which you will be filling as you write.

If these files already exists, run the following command

```bash
inky
```

## Template Creations

Templates are basic text files with tags denoted by the `{{ tag }}` in the text file. Each tags must match a selection of option key in the options file. Otherwise an error is thrown. The template is written in `/workspace/template.txt`

Below are table of a tags and special tags denoted by an underscore `_tag` that each have unique properties

| Tags           | Descriptions                                                      |
| -------------- | ----------------------------------------------------------------- |
| `{{ tag }}`     | Simple tag, will match to the same key as seen in the options.yml |
| `{{ \_time }}`   | Returns the current time                                          |
| `{{ \_manual }}` | Forces a manual input                                             |

For non-special tags, they can be given options along with certain values depending on the input

| Options                      | Descriptions                                                                                                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `{{ tag -r }}`                 | Randomly select from the options provided by the tag                                                                                                                                             |
| `{{ tag -l <count> <delim> }}` | Allow you to loop the same options by a specific count and deliminated by a specifc deliminator. For infinite looping, use a negative number for the count. Select DONE to terminate the looping |
>>>>>>> 82ff817a0a10cd522df66d58353a031bd6e0915f

## Options Writing

Options are the selection which is tag is associated with.

For example:

```yaml
greeting:
  - "Yo!"
  - "Hello, "
  - "Howdy"

affect:
  - "tired?"
  - "thirsty?"
  - "sick of the establishment?"
```

You can add new option tags as well as selections for each tag
