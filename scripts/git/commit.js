#!/usr/bin/env node
const { exec } = require("child_process");
const events = require('events');
const fs = require('fs');
const readline = require('readline');

const CONTRIBUTORS_FILE = './scripts/git/contributors.csv'
const STORY_PREFIX = "BCS"

const getContributors = async () => {
    let contributors = [];
    try {
        const rl = readline.createInterface({
            input: fs.createReadStream(CONTRIBUTORS_FILE),
            crlfDelay: Infinity
        });

        rl.on('line', (line) => {
            const split = line.split(",")
            contributors.push(split);
        });

        await events.once(rl, 'close');
    } catch (err) {
        console.log(err)
    }
    return contributors;
};

const printContributors = async (contributors) => {
    console.log("The contributors to this repository:");
    contributors.forEach(contributor => console.log(`${contributor[0]} (${contributor[1]})`))
};

const read = async (prompt) => {
    let answer = "";
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(prompt, function (userInput) {
        answer = userInput;
        rl.close();
    });

    await events.once(rl, 'close');
    return answer;
}

const readStoryNumber = async () => {
    const storyNumber = await read(`Story number: ${STORY_PREFIX}-`)
    return `${STORY_PREFIX}-${storyNumber}`;
}

const readPairs = async (contributors) => {
    let pairNo = 1;
    let pair = ""
    let pairs = "";
    for (let i = 1; i <= contributors.length; i++) {
        pair = await read(`Enter shorthand of ${pairNo++}. pair (leave empty if none): `)
        if (pair === "") break;

        for (let contributor of contributors) {
            if (contributor[0] === pair) {
                if (i > 1) {
                    pairs += "\n"
                }
                pairs += `Co-authored by: ${contributor[1]} <${contributor[2]}>`
            }
        }
    }
    return pairs;
}

const readShortDescription = async () => await read("Commit short description: ");
const readLongDescription = async () => await read("Further description (optional): ");
const printNewLine = () => console.log("")

const commit = (story, pairs, shortDesc, longDesc) => {
    exec(`git commit -m "[${story}] ${shortDesc}" -m "${longDesc}" -m "${pairs}"`, (err, output) => {
        if (err) {
            console.error("could not execute command: ", err)
            return
        }
        console.log("Output: \n", output)
    })
}

const main = async () => {
    const contributors = await getContributors();
    await printContributors(contributors);
    printNewLine();
    const story = await readStoryNumber();
    printNewLine();
    const pairs = await readPairs(contributors);
    printNewLine();
    const shortDesc = await readShortDescription();
    printNewLine();
    const longDesc = await readLongDescription();

    commit(story, pairs, shortDesc, longDesc);
}

main().then()