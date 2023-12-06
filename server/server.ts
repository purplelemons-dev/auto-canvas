
import express from "express";
import { env } from "./env"
import OpenAI from "openai";

const app = express();
const HOST = "localhost";
const PORT = 2048;
const openai = new OpenAI({ apiKey: env.openai, organization: env.openaiOrg });

app.use(express.json());

app.post("/v1/autocanvas/google", async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    const {
        question,
        options
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
    res.setHeader("Access-Control-Allow-Origin", "*");
    const {
        question,
        options
    }: {
        question: string,
        options: {
            text: string;
            object: Element;
        }[]
    } = req.body;
    const result = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: [
            {
                role: "system",
                content: "You will answer using only ONE line of text ONLY from the user's prompt."
            },
            {
                role: "user",
                content: `Q: ${question}\n\nA:\n` + options.map(({ text }) => text).join("\n")
            }
        ]
    })
    if (result.choices.length === 0) {
        res.sendStatus(404);
        return;
    }
    try {
        const model_answer = result.choices[0].message.content || "";
        res.json({
            model_answer: model_answer
        });
    }
    catch { res.sendStatus(500); }
});


app.options("/v1/autocanvas/*", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.end();
});

app.listen(PORT, () => {
    console.log(`Server is listening on http://${HOST}:${PORT}`);
});
