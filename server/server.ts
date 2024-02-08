
import express from "express";
import { env } from "./env"
import OpenAI from "openai";
import { JSDOM } from "jsdom";

const app = express();
const HOST = "0.0.0.0";
const PORT = 5500;
const openai = new OpenAI({ apiKey: env.openai, organization: env.openaiOrg });

app.use(express.json());
app.use((req, res, next) => {
    if (req.method === 'POST') {
        res.setHeader("Access-Control-Allow-Origin", "https://collin.instructure.com");
    }
    next();
});

app.post("/v1/autocanvas/google", async (req, res) => {
    const {
        question
    }: {
        question: string,
        options: string[]
    } = req.body;
    const encodedQuestion = encodeURIComponent(question);
    const result: {
        items: {
            title: string,
            link: string,
            snippet: string
        }[],
        searchInformation: {
            totalResults: string
        }
    } = await (
        await fetch(`https://customsearch.googleapis.com/customsearch/v1?key=${env.key}&cx=${env.cx}&q=${encodedQuestion}`)
    ).json();
    if (result.searchInformation.totalResults === "0") {
        res.status(404).json([]);
        return;
    }
    try {
        res.json(result["items"].map(({ link, snippet, title }) => {
            return `${title}\n${snippet}\n${link}\n`;
        }));
    }
    catch { res.status(500).json([]); }
});

app.post("/v1/autocanvas/gpt", async (req, res) => {
    const {
        question,
        options
    }: {
        question: string,
        options: {
            letter: string,
            text: string
        }[]
    } = req.body;

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
        (await
            fetch(`https://customsearch.googleapis.com/customsearch/v1?key=${env.key}&cx=${env.cx}&q=${encodeURIComponent(question)}`)
        ).json().then(async (result) => {

            const link = result.items[0].link;
            (await fetch(link)).text().then(async (quizlet_page) => {
                const document = new JSDOM(quizlet_page).window.document;
                if (document !== null) {
                    const infoElement = document.querySelectorAll("span[class$=wordText]");
                    const questions = Array.from(infoElement).map((info) => info.textContent);
                    const answerElements = document.querySelectorAll("a[class$=definitionText]");
                    const answers = Array.from(answerElements).map((answer) => answer.textContent);
                    const formattedQA = questions.map((question, index) => `Q: ${question}\nA: ${answers[index]}`).join("\n");
                    res.json({
                        model_answer: JSON.parse(
                            (await
                                openai.chat.completions.create({
                                    model: "gpt-4-1106-preview",
                                    messages: [
                                        {
                                            role: "system",
                                            content: `You will answer using JSON ONLY. Use this typescript format:${response_format}`
                                        },
                                        {
                                            role: "user",
                                            content: `Context:\n${formattedQA}\nQ: ${question}\n\n${formattedOptions}`
                                        }
                                    ],
                                    top_p: 0.1,
                                    temperature: 0.0,
                                    max_tokens: 128,
                                    seed: 42069,
                                    response_format: { "type": "json_object" }
                                })
                            ).choices[0].message.content || "{answers: []}"
                        ).answers
                    });
                }
            });
        });
    } catch (e) {
        res.status(500).send(e);
    }
});


app.options("/v1/autocanvas", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "https://collin.instructure.com");
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.end();
});

app.listen(PORT, () => {
    console.log(`Server is listening on http://${HOST}:${PORT}`);
});
