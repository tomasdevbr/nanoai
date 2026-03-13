const AI = (() => {
    let currentSession = null;

    async function checkDetailedStatus() {
        try {
            const multimodalConfig = {
                expectedInputs: [{ type: "text" }, { type: "image" }, { type: "audio" }]
            };
            return await LanguageModel.availability(multimodalConfig);
        } catch (error) {
            console.error("Erro ao verificar status detalhado:", error);
            return "unavailable";
        }
    }

    async function checkSupport() {
        const status = await checkDetailedStatus();
        return status !== "unavailable";
    }

    async function getSession(onProgress) {
        if (currentSession) return currentSession;

        const history = await getHistory();
        const recentHistory = history.slice(0, 5).reverse();

        const initialPrompts = [
            { role: 'system', content: `Você é um assistente de IA que responde de forma clara e objetiva. Lembre-se do contexto das conversas anteriores para ajudar melhor o usuário.` }
        ];

        recentHistory.forEach(item => {
            initialPrompts.push({ role: 'user', content: item.question });
            initialPrompts.push({ role: 'assistant', content: item.answer });
        });

        try {
            const options = {
                expectedInputs: [{ type: "text" }, { type: "image" }, { type: "audio" }],
                temperature: 0.8, topK: 3, initialPrompts
            };

            // Se um callback de progresso foi fornecido, usamos o monitor
            if (onProgress) {
                options.monitor = (m) => {
                    m.addEventListener('downloadprogress', (e) => {
                        onProgress(e.loaded, e.total);
                    });
                };
            }

            currentSession = await LanguageModel.create(options);
            if (currentSession) return currentSession;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async function resetSession() {
        if (currentSession) {
            currentSession.destroy();
            currentSession = null;
        }
    }

    /**
     * @param {string|Array} inputContent - Texto ou array de partes [{type: 'text', value: '...'}, {type: 'image', value: blob}]
     */
    async function generateResponse(inputContent, onTokenCb) {
        const session = await getSession();

        // Determinar quais tipos o modelo suporta com base na sessão
        // Infelizmente a API ainda não expõe isso claramente, então vamos tentar ser inteligentes
        // e usar 'data' para imagens/áudio que é mais comum em versões recentes.

        let content;
        if (typeof inputContent === 'string') {
            content = [{ type: 'text', value: inputContent }];
        } else {
            // Se for array de partes, garantir que os campos estão corretos e filtrar se necessário
            content = inputContent.map(part => {
                if (part.type === 'text') return part;

                // Para imagem/áudio, incluímos mimeType e usamos 'data'
                return {
                    type: part.type,
                    data: part.value,
                    value: part.value, // Backup
                    mimeType: part.value.type // O Blob/File já tem a propriedade type
                };
            });
        }

        try {
            const responseStream = await session.promptStreaming([{ role: 'user', content: content }]);
            let fullText = "";
            for await (const token of responseStream) {
                fullText += token;
                onTokenCb(fullText);
            }
            return fullText;
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    return { checkSupport, generateResponse, resetSession };
})();
