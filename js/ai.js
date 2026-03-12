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
        const session = await LanguageModel.create({
            expectedInputLanguages: ["pt"],
            temperature: 1,
            topK: 1,
            initialPrompts: [{ role: 'system', content: `Você é um assistente de IA que responde de forma clara e objetiva.` }],
            monitor(m) {
                m.addEventListener('downloadprogress', (e) => {
                    const percentage = Math.round((e.loaded / e.total) * 100);
                    console.log(`Baixando modelo: ${percentage}% (${e.loaded} / ${e.total} bytes)`);
                    // Se quiser mostrar na UI, você pode passar um callback extra para o generateResponse:
                    // if (onDownloadProgressCb) onDownloadProgressCb(percentage);
                });
            }
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
