const AI = (() => {
    async function checkSupport() {
        try {
            if (typeof LanguageModel === 'undefined') {
                return 'permission_needed';
            }
            if (LanguageModel === null) {
                return 'unsupported';
            }
            const availability = await LanguageModel.availability();
            return availability !== 'no' ? 'supported' : 'permission_needed';
        } catch (error) {
            return 'unsupported';
        }
    }

    async function generateResponse(question, onTokenCb) {
        const params = await LanguageModel.params();
        console.log(params)
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

    return { checkSupport, generateResponse };
})();
