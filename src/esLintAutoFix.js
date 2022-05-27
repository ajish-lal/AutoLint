const { execSync } = require('child_process');
const fs = require('fs');
const { WORKSPACE_PATH } = require('./config');

const rulesArray = ["eqeqeq"];

const startAutoLintFix = () => {
    console.log("Starting AutoLintFix!");
    const output = require("../output/LinterOutputForFix.json");

    const filteredLintObjects = output.filter(lintObject => lintObject.messages.find(message => rulesArray.includes(message.ruleId)));
    filteredLintObjects.forEach(lintObject => {
        console.log(lintObject.filePath);
        const fileContentAsArray = fs.readFileSync(lintObject.filePath).toString().split("\n");
        let prevLine = null;
        delete lintObject["source"];

        lintObject.messages.forEach(message => {
            if (message.ruleId === "eqeqeq") {
                // To prevent duplicate entry
                if (prevLine !== message.line) {
                    if (fileContentAsArray[message.line - 1].match(/(?<![!=])([!=]=)(\s*["'])/g)) {

                        fileContentAsArray[message.line - 1] = fileContentAsArray[message.line - 1].replace(/(?<![!=])(==)(\s*")/g, "=== \"");
                        fileContentAsArray[message.line - 1] = fileContentAsArray[message.line - 1].replace(/(?<![!=])(!=)(\s*")/g, "!== \"");
                        fileContentAsArray[message.line - 1] = fileContentAsArray[message.line - 1].replace(/(?<![!=])(==)(\s*')/g, "=== \'");
                        fileContentAsArray[message.line - 1] = fileContentAsArray[message.line - 1].replace(/(?<![!=])(!=)(\s*')/g, "!== \'");

                        prevLine = message.line;
                    }
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
        execSync(`${dir} && npm run env -- eslint ./src --format json --output-file ${formattedDirName}/output/LinterOutputForFix.json`);
    } catch (error) {
        console.log(error.message);
    } finally {
        console.log("AutoLint Completed!");
        startAutoLintFix();
    }
}

runEsLint();