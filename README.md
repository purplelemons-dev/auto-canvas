# Auto-Canvas

browser extension (developed for Edge) to automatically google quizlet answers.

https://github.com/purplelemons-dev/auto-canvas/assets/63922192/9efa3537-cd2d-4836-90e5-7de26e33f0df

## How it works

the client (browser) loads a button on each question. on button press, the client sends the server 1) the question, and 2) the options avaliable. the options are also assigned a letter for backend convienince.

the server will use google to find a quizlet URL associated with the question. then, the server uses `JSDOM` to find each question and answer on the quizlet page and formats it nicely in a string.

the long Q/A string is then passed on to GPT4 as well as the original question and answer option set. GPT4 will respond with a list of answers, accounting for the fact that some questions are MCMA. It's answer is then passed to the client, where the answer(s) are labeled with the client-side lettering and the model's reasoning.

the client cycles through all the answer(s) and will highlight correct choices with green and autoselect correct choice(s).

a info-button is added under "Get Answer" for the user to view the model's reasoning.

## setup

### server

```bash
git clone https://github.com/purplelemons-dev/auto-canvas.git
cd auto-canvas
npm i
```

get your own api key and CX (custom search engine ID) from google programmable search engines (you can customize the search restrictions how you like, but it have it set to `*.quizlet.com`). plug those values into `./server/env.template.ts` and remove the `.template`

### extension

in your browser, load the extension (you may need to enable developer options) by using the `./extension/edge` folder.

## run

in `.../auto-canvas/server`

```bash
node .
```

## use

will automatically add `Get Answer` button to all questions on quizzes and throw up a pop-up textarea with quizlet results.
