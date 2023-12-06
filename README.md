# Auto-Canvas

browser extension (developed for Edge) to automatically google quizlet answers.

https://github.com/purplelemons-dev/auto-canvas/assets/63922192/9efa3537-cd2d-4836-90e5-7de26e33f0df

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
