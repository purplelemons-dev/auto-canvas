
import express from "express";
import { env } from "./env"

const app = express();
const HOST = "localhost";
const PORT = 2048;

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

app.options("/v1/autocanvas/google", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.end();
});

app.listen(PORT, () => {
    console.log(`Server is listening on http://${HOST}:${PORT}`);
});
