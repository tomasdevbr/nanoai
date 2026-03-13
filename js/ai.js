const AI = (() => {
    let currentSession = null;

    async function checkSupport() {
        try {
            return await LanguageModel.availability();
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    async function getSession() {
        if (currentSession) return currentSession;

        // Recuperar as últimas 5 conversas do banco para dar contexto
        const history = await getHistory();
        const recentHistory = history.slice(0, 5).reverse();
        
        const initialPrompts = [
            { role: 'system', content: `Você é um assistente de IA que responde de forma clara e objetiva. Lembre-se do contexto das conversas anteriores para ajudar melhor o usuário.` }
        ];

        // Adicionar histórico recente aos prompts iniciais
        recentHistory.forEach(item => {
            initialPrompts.push({ role: 'user', content: item.question });
            initialPrompts.push({ role: 'assistant', content: item.answer });
        });

        currentSession = await LanguageModel.create({
            expectedInputLanguages: ["pt"],
            temperature: 0.8,
            topK: 3,
            initialPrompts: initialPrompts
        });

        return currentSession;
    }

    async function resetSession() {
        if (currentSession) {
            currentSession.destroy();
            currentSession = null;
        }
    }

    async function generateResponse(question, onTokenCb) {
        const session = await getSession();

        const responseStream = await session.promptStreaming([{ role: 'user', content: question }]);
        let fullText = "";
        for await (const token of responseStream) {
            fullText += token;
            onTokenCb(fullText);
        }
        return fullText;
    }

    return { checkSupport, generateResponse, resetSession };
})();
