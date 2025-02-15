'use strict';
import 'dotenv/config';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore'
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { genAIService } from './ai-service.js';
import { runDiscordBot } from './discord-service.js';

const gcp = initializeApp();
const db = getFirestore(gcp);

const genAI = genAIService(db);

runDiscordBot(genAI, db);

const app = express();
// Middleware
app.use(cookieParser());
app.use(cors({ origin: true }));
app.use(express.json())

app.post('/reload-prompts', async (_, res) => {
    await genAI.reloadPrompts();
    res.send({ success: true });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Dungeon Master Web listening ${port}`)
})

