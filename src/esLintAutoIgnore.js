const { execSync } = require('child_process');
const fs = require('fs');
const { WORKSPACE_PATH } = require('./config');

const RULES = {
    "eqeqeq": "// eslint-disable-next-line eqeqeq",
    "no-alert": "// eslint-disable-next-line no-alert"
};

const formatExtractor = (content) => {
    let format = "";
    if (content) {
        const regex = /([\t ]+)(.+)/;
        const result = regex.exec(content);
        if (result) {
            format = result[1];
        }
    }
    return format;
}

const startAutoLintIgnore = () => {
    console.log("Starting AutoLintIgnore!");
    const output = require("../output/LinterOutput.json");
    const rulesArray = [];

    for (const key in RULES) {
        rulesArray.push(key);
    }

    const filteredLintObjects = output.filter(lintObject => lintObject.messages.find(message => rulesArray.includes(message.ruleId)));
    filteredLintObjects.forEach(lintObject => {
        console.log(lintObject.filePath);
        const fileContentAsArray = fs.readFileSync(lintObject.filePath).toString().split("\n");
        let lineIncrementor = -1;
        let prevLine = null;
        delete lintObject["source"];

        lintObject.messages.forEach(message => {
            if (rulesArray.includes(message.ruleId)) {
                // To prevent duplicate entry
                if (prevLine !== message.line) {
                    // Code to extract and keep the existing format
                    const format = formatExtractor(fileContentAsArray[message.line + lineIncrementor]);
                    // Code to modify the file
                    fileContentAsArray.splice(message.line + lineIncrementor, 0, format + RULES[message.ruleId]);
                    lineIncrementor++;
                    prevLine = message.line;
                }
            }
        });

        const fileContent = fileContentAsArray.join("\n");
        fs.writeFile(lintObject.filePath, fileContent, function (err) {
            if (err) return console.log(err);
        });
    });
}

const runEsLint = () => {
    const dir = `cd ${WORKSPACE_PATH}`;
    const formattedDirName = __dirname.replace(/ /g, '\\ ').replace("/src", "");
    try {
        execSync(`${dir} && npm run env -- eslint ./src --format json --output-file ${formattedDirName}/output/LinterOutput.json`);
    } catch (error) {
        console.log(error.message);
    } finally {
        console.log("AutoLint Completed!");
        startAutoLintIgnore();
    }
}

runEsLint();