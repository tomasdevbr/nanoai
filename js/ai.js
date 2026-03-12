const AI = (() => {
    async function checkSupport() {
        try {
            const availability = await LanguageModel.availability();
            return availability !== 'no';
        } catch (error) {
            return false;
        }
    }

    async function getAvailability() {
        try {
            return await LanguageModel.availability();
        } catch (error) {
            return 'no';
        }
    }

    async function downloadModel(onProgress) {
        await LanguageModel.create({
            monitor(m) {
                m.addEventListener('downloadprogress', (e) => {
                    const pct = e.total > 0 ? Math.round((e.loaded / e.total) * 100) : 0;
                    onProgress(pct);
                });
            }
        });
    }

    async function generateResponse(question, onTokenCb) {
        const params = await LanguageModel.params();
        if (!params) {
            throw new Error("Modelo Gemini Nano ainda não está pronto. Acesse chrome://components/, procure por 'Optimization Guide On Device Model' e clique em 'Check for update'. Aguarde o download e tente novamente.");
        }
        const session = await LanguageModel.create({
            expectedInputLanguages: ["pt"],
            temperature: params.defaultTemperature,
            topK: params.defaultTopK || 1,
            initialPrompts: [{ role: 'system', content: `Você é um assistente de IA que responde de forma clara e objetiva.` }],
        });

        const responseStream = await session.promptStreaming([{ role: 'user', content: question }]);
        let fullText = "";
        for await (const token of responseStream) {
            fullText += token;
            onTokenCb(fullText);
        }
        return fullText;
    }

    return { checkSupport, getAvailability, downloadModel, generateResponse };
})();
