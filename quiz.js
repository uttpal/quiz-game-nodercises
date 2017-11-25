const fs = require('fs');
const readline = require('readline');
const {promisify} = require('util');
const argv = require('minimist')(process.argv.slice(2)); // Use minimist to parse cli arguments
const parse =  promisify(require('csv-parse'));


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const terminalInput = (question) => new Promise((resolve) => {
    rl.question(question, resolve);
  });

const timeLimit = (argv.timer || 30) * 1000; // Set default timer value to 30 seconds and convert to ms
const csvFilePath = argv.csvpath || './problems.csv';
const csvFileSteam = fs.readFileSync(csvFilePath); // Using Syncronous api of fs, NOT Recommended for production use

(async (rl, timeLimit) => {
  problems = await parse(csvFileSteam, {});
  let correctCount = 0;
  //Start The timer
  setTimeout(() => {
    console.log('you Solved', correctCount);
    process.exit(0);
  }, timeLimit);
  for (const index in problems) {
    if (problems.hasOwnProperty(index)) {
      let question = problems[index][0] + '\n';
      let answer = problems[index][1];
      let userAnswer = await terminalInput(question);
      if(userAnswer === answer)  correctCount+=1;
    }
  }
  return correctCount;
})(rl, timeLimit).then((correctCount) => {
  console.log('you Solved', correctCount);
  process.exit(0);
});
