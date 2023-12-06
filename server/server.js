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
const app = (0, express_1.default)();
const HOST = "localhost";
const PORT = 2048;
app.use(express_1.default.json());
app.post("/v1/autocanvas/google", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.setHeader("Access-Control-Allow-Origin", "*");
    const { question, options } = req.body;
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
app.options("/v1/autocanvas/google", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.end();
});
app.listen(PORT, () => {
    console.log(`Server is listening on http://${HOST}:${PORT}`);
});
