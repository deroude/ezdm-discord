import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = "gemini-2.0-flash-exp";

export function genAIService(db) {

    const promptDefinitions = {};

    const reloadPrompts = async () => {
        const prompts = await db.collection('prompts').get();
        prompts.forEach(prompt => {
            promptDefinitions[prompt.id] = prompt.data();
        });
    }

    const generateAdventure = async (userHint) => {
        if (Object.keys(promptDefinitions).length === 0) { await reloadPrompts(); }
        const prompt = promptDefinitions['adventure'];
        const promptText = prompt.promptPattern.replace('#userHint', userHint || '')
        return genAI.getGenerativeModel({ model }).generateContent({
            systemInstruction: prompt.systemHint,
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: promptText
                        }
                    ]
                }
            ]
        })
    }

    const generateCharacter = async (userHint, name, gender, clazz, race) => {
        if (Object.keys(promptDefinitions).length === 0) { await reloadPrompts(); }
        const prompt = promptDefinitions['character'];
        const promptText = prompt.promptPattern
            .replace('#userHint', userHint || '')
            .replace('#name', name)
            .replace('#gender', gender)
            .replace('#class', clazz)
            .replace('#race', race)
        return genAI.getGenerativeModel({ model }).generateContent({
            systemInstruction: prompt.systemHint,
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: promptText
                        }
                    ]
                }
            ]
        })
    }

    const generateLogSuggestion = async (userHint, sessionId) => {
        if (Object.keys(promptDefinitions).length === 0) { await reloadPrompts(); }
        const prompt = promptDefinitions['log'];
        const session = await db.collection('sessions').doc(sessionId).get();
        const adventure = await db.collection('adventures').doc(session.data().adventureId).get();
        const characterRefs = session.data().characterIds.map((id) => db.collection('characters').doc(id));
        const characters = await db.getAll(...characterRefs);
        const logDocs = await db.collection(`sessions/${sessionId}/log`).get();
        const systemInstruction = prompt.systemHint
            .replace('#adventure', adventure.data().content)
            .replace('#characters', characters.map(c => c.data().content).join('\n\n\n'))
            .replace('#log', (logDocs.docs || []).map(doc => `Action: \n${doc.data().action}\n\n Resolution: \n${doc.data().resolution}`).join('\n\n\n'));
        const promptText = prompt.promptPattern.replace('#userHint', userHint)
        return genAI.getGenerativeModel({ model }).generateContent({
            systemInstruction,
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: promptText
                        }
                    ]
                }
            ]
        })
    }

    const generateLogResolution = async (action, context, roll, sessionId) => {
        if (Object.keys(promptDefinitions).length === 0) { await reloadPrompts(); }
        const prompt = promptDefinitions['log-resolution'];
        const session = await db.collection('sessions').doc(sessionId).get();
        const adventure = await db.collection('adventures').doc(session.data().adventureId).get();
        const characterRefs = session.data().characterIds.map((id) => db.collection('characters').doc(id));
        const characters = await db.getAll(...characterRefs);
        const logDocs = await db.collection(`sessions/${sessionId}/log`).get();
        const systemInstruction = prompt.systemHint
            .replace('#adventure', adventure.data().content)
            .replace('#characters', characters.map(c => c.data().content).join('\n\n\n'))
            .replace('#log', (logDocs.docs || []).map(doc => `Action: \n${doc.data().action}\n\n Resolution: \n${doc.data().resolution}`).join('\n\n\n'));
        const promptText = prompt.promptPattern
            .replace('#action', action)
            .replace('#context', context)
            .replace('#roll', roll)
        return genAI.getGenerativeModel({ model }).generateContent({
            systemInstruction,
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: promptText
                        }
                    ]
                }
            ]
        })
    }

    return { generateAdventure, generateCharacter, generateLogSuggestion, generateLogResolution, reloadPrompts, promptDefinitions };
}