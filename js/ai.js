const AI = (() => {
    async function checkSupport() {
        try {
            const availability = await LanguageModel.availability();
            return availability;
        } catch (error) {
            return false;
        }
    }

    async function generateResponse(question, onTokenCb) {
        const session = await LanguageModel.create({
            expectedInputLanguages: ["pt"],
            temperature: 1,
            topK: 1,
            initialPrompts: [{ role: 'system', content: `Você é um assistente de IA que responde de forma clara e objetiva.` }]
        });

        const responseStream = await session.promptStreaming([{ role: 'user', content: question }]);
        let fullText = "";
        for await (const token of responseStream) {
            fullText += token;
            onTokenCb(fullText);
        }
        return fullText;
    }

    return { checkSupport, generateResponse };
})();
