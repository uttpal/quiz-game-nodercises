# Intoduction
This is a Node.js Port of popular [Gophercises](https://gophercises.com/exercises/quiz) quiz game exercise.

# Usage
```
npm install
node quiz.js --timer=2
```
# Exercise : Quiz Game

## Exercise details

Create a program that will read in a quiz provided via a CSV file (more details below) and will then give the quiz to a user keeping track of how many questions they get right and how many they get incorrect. Regardless of whether the answer is correct or wrong the next question should be asked immediately afterwards.

The CSV file should default to `problems.csv`, but the user should be able to customize the filename via a flag.

The CSV file will be in a format like below, where the first column is a question and the second column in the same row is the answer to that question.

```
5+5,10
7+3,10
1+1,2
8+3,11
1+2,3
8+6,14
3+1,4
1+4,5
5+1,6
2+3,5
3+3,6
2+4,6
5+2,7
```

You can assume that quizzes will be relatively short (< 100 questions) and will have single word/number answers.

At the end of the quiz the program should output the total number of questions correct and how many questions there were in total. Questions given invalid answers are considered incorrect.

Add a Timer. The default time limit should be 30 seconds, but should also be customizable via a flag.

Your quiz should stop as soon as the time limit has exceeded. That is, you shouldn't wait for the user to answer one final questions but should ideally stop the quiz entirely even if you are currently waiting on an answer from the end user.

Users should be asked to press enter (or some other key) before the timer starts, and then the questions should be printed out to the screen one at a time until the user provides an answer. Regardless of whether the answer is correct or wrong the next question should be asked.

At the end of the quiz the program should still output the total number of questions correct and how many questions there were in total. Questions given invalid answers or unanswered are considered incorrect.


# Solution

## Approach
Lets break our problem into multiple parts and try to solve each one by one.
1. Parse Terminal Parameters (eg. time limit)
2. Parse CSV file and create list of questions
3. Read the answer of user from terminal
4. Implement the timer

## Let's Start

### Parse Cli options
To parse the command line parameters we will be using simple module called [minimist](https://github.com/substack/minimist). Its leally simple to use we will jsut pass all the command line argument to it and it will return us object with key value pairs after parsing.

```
const argv = require('minimist')(process.argv.slice(2));

const timeLimit = (argv.timer || 30) * 1000; // *1000 convert to ms
const csvFilePath = argv.csvpath || './problems.csv';
```

First 2 elements of `process.argv` are node command name and script filename, thats why sliced. Timelimit is assigned to default of 30 and csv default assigned to `Problem.csv`


### Parse CSV

To parse csv files we will be using node module called [csv-parse](https://www.npmjs.com/package/csv-parse) which will convert csv into array of problems.

Csv-parse does not have a promise based api, to make it easier to work with we will promisify it using `promisify` function from utils module which is available since node 8.

```
const {promisify} = require('util');
const parse =  promisify(require('csv-parse'));
```

Now we can parse the csv using this parse function, it takes 2 argumenst 1st is the csv data 2nd is the options (this will be empty in our case as we do not need any changes).

```
const csvFileData = fs.readFileSync(csvFilePath); // Read the csv file 
const problems = await parse(csvFileSteam, {});
```

### Read Input

Reading input is little diffrent in node.js than other languages, we will be using builtin module called `readline` in which first need to specify the input and output and create interface to interact with them.
The api of readline interface to scan input is event based and to make it easier to use we will convert it to promise based api.

```
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const terminalInput = (question) => new Promise((resolve) => {
    rl.question(question, resolve);
  });
 
```

You can notice that we promisified csv-parse function using `romisify` but here we are not using it, the reason is because `promisify` only supports standard callback function i.e function which has this format `(err,result)`, but  our `readline.question` function's callback just takes one argument thas why we promisified it with using the native promise class.

### Implement Timeout

Implementing Timeout feature is easy in JS using in-built `setTimeout` function,
its simple and straightforward. When we reacht he timeout we must print the result and exit.

```
setTimeout(() => {
    console.log(`Congratualations! you Solved ${correctCount} out of ${problems.length} questions`);
    process.exit(0);
  }, timeLimit);
```


### Binding Together

As we have already solved all the diffrent parts of excercise we just need to bind it together. After parsing the csv we need to iterate over all the problems  display the question, wait for answer and match it with correct one.

Here is the complete code and [github repository](https://github.com/uttpal/quiz-game-nodercises)

```

const fs = require('fs');
const readline = require('readline');
const {promisify} = require('util');
const argv = require('minimist')(process.argv.slice(2)); // Use minimist to parse cli arguments
const parse =  promisify(require('csv-parse'));

const timeLimit = (argv.timer || 30) * 1000; // Set default timer value to 30 seconds and convert to ms
const csvFilePath = argv.csvpath || './problems.csv';
const csvFileData = fs.readFileSync(csvFilePath); // Using Syncronous api of fs, NOT Recommended for production use

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const terminalInput = (question) => new Promise((resolve) => {
    rl.question(question, resolve);
  });


(async (rl, timeLimit) => {
  const problems = await parse(csvFileData, {});
  let correctCount = 0;
  //Start The timer
  setTimeout(() => {
    console.log(`Congratualations! you Solved ${correctCount} out of ${problems.length} questions`);
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
  return {correctCount, total: problems.length};
})(rl, timeLimit).then(({correctCount, total}) => {
  console.log(`Congratualations! you Solved ${correctCount} out of ${total} questions`);
  process.exit(0);
});
```

Thank You for reading!

