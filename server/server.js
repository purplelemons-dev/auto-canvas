"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const env_1 = require("./env");
const openai_1 = __importDefault(require("openai"));
const jsdom_1 = require("jsdom");
const app = (0, express_1.default)();
const HOST = "localhost";
const PORT = 2048;
const openai = new openai_1.default({ apiKey: env_1.env.openai, organization: env_1.env.openaiOrg });
app.use(express_1.default.json());
app.use((req, res, next) => {
    if (req.method === 'POST') {
        res.setHeader("Access-Control-Allow-Origin", "https://collin.instructure.com");
    }
    next();
});
app.post("/v1/autocanvas/google", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { question } = req.body;
    const encodedQuestion = encodeURIComponent(question);
    const result = yield (yield fetch(`https://customsearch.googleapis.com/customsearch/v1?key=${env_1.env.key}&cx=${env_1.env.cx}&q=${encodedQuestion}`)).json();
    if (result.searchInformation.totalResults === "0") {
        res.status(404).json([]);
        return;
    }
    try {
        res.json(result["items"].map(({ link, snippet, title }) => {
            return `${title}\n${snippet}\n${link}\n`;
        }));
    }
    catch (_a) {
        res.status(500).json([]);
    }
}));
app.post("/v1/autocanvas/gpt", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { question, options } = req.body;
    const response_format = `
{
    answers: {
        letter: string,
        reason: string
    }[]
}`;
    const formattedOptions = options.map(({ letter, text }) => {
        return `${letter}) ${text}`;
    }).join("\n");
    try {
        (yield fetch(`https://customsearch.googleapis.com/customsearch/v1?key=${env_1.env.key}&cx=${env_1.env.cx}&q=${encodeURIComponent(question)}`)).json().then((result) => __awaiter(void 0, void 0, void 0, function* () {
            const link = result.items[0].link;
            (yield fetch(link)).text().then((quizlet_page) => __awaiter(void 0, void 0, void 0, function* () {
                const document = new jsdom_1.JSDOM(quizlet_page).window.document;
                if (document !== null) {
                    const infoElement = document.querySelectorAll("span[class$=wordText]");
                    const questions = Array.from(infoElement).map((info) => info.textContent);
                    const answerElements = document.querySelectorAll("a[class$=definitionText]");
                    const answers = Array.from(answerElements).map((answer) => answer.textContent);
                    const formattedQA = questions.map((question, index) => `Q: ${question}\nA: ${answers[index]}`).join("\n");
                    res.json({
                        model_answer: JSON.parse((yield openai.chat.completions.create({
                            model: "gpt-4-1106-preview",
                            messages: [
                                {
                                    role: "system",
                                    content: `Answer using the following JSON format ONLY:${response_format}`
                                },
                                {
                                    role: "user",
                                    content: `Context:\n${formattedQA}\nQ: ${question}\n\n${formattedOptions}`
                                }
                            ],
                            top_p: 0.9,
                            temperature: 0.69,
                            response_format: { "type": "json_object" }
                        })).choices[0].message.content || "[]").answers
                    });
                }
            }));
        }));
    }
    catch (e) {
        res.status(500).send(e);
    }
}));
app.options("/v1/autocanvas/*", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "https://collin.instructure.com");
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.end();
});
app.listen(PORT, () => {
    console.log(`Server is listening on http://${HOST}:${PORT}`);
});
