const fs = require('fs');

const RULES = {
    "eqeqeq": "// eslint-disable-next-line eqeqeq",
    // "no-alert": "// eslint-disable-next-line no-alert"
};

const startAutoLintIgnore = () => {
    console.log("Starting AutoLintRemoval!");
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
            if (message.ruleId === "eqeqeq") {
                // To prevent duplicate entry
                if (prevLine !== message.line) {
                    if (fileContentAsArray[message.line + lineIncrementor].includes("// eslint-disable-next-line eqeqeq")) {
                        fileContentAsArray.splice(message.line + lineIncrementor, 1);
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

startAutoLintIgnore();