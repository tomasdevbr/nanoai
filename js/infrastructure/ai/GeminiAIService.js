/**
 * Implementação do AIService usando a Prompt API do Google Gemini Nano.
 */
class GeminiAIService extends AIService {
    constructor() {
        super();
        this.currentSession = null;
        this.settings = {
            temperature: 0.8,
            topK: 3,
            systemPrompt: 'Você é um assistente de IA prestativo.'
        };
    }

    async getAPI() {
        return typeof LanguageModel !== 'undefined' ? LanguageModel :
            (window.ai && window.ai.languageModel ? window.ai.languageModel : null);
    }

    async checkAvailability() {
        const API = await this.getAPI();
        if (!API) return "unavailable";

        try {
            const availability = await API.availability({ expectedInputs: [{ type: "text" }, { type: "image" }, { type: "audio" }] });
            console.log(availability)
            return availability;
        } catch (error) {
            console.error("GeminiAIService: Erro ao verificar disponibilidade", error);
            return "unavailable";
        }
    }

    async getSession(onProgress) {
        if (this.currentSession) return this.currentSession;

        const API = await this.getAPI();
        if (!API) throw new Error("Prompt API não disponível.");

        try {
            const options = {
                expectedInputs: [{ type: "text" }, { type: "image" }, { type: "audio" }],
                temperature: this.settings.temperature,
                topK: this.settings.topK,
                initialPrompts: [{ role: 'system', content: this.settings.systemPrompt }]
            };

            if (onProgress) {
                options.monitor = (m) => {
                    m.addEventListener('downloadprogress', (e) => onProgress(e.loaded, e.total));
                };
            }

            this.currentSession = await API.create(options);
            return this.currentSession;
        } catch (error) {
            console.error("GeminiAIService: Erro ao criar sessão", error);
            throw error;
        }
    }

    async generateResponse(inputContent, onTokenCb) {
        const session = await this.getSession();

        const content = inputContent.map(part => {
            if (part.type === 'text') return part;
            return {
                type: part.type,
                data: part.value,
                value: part.value, // Requerido em algumas versões da API
                mimeType: part.value.type
            };
        });

        try {
            const responseStream = await session.promptStreaming([{ role: 'user', content }]);
            let fullText = "";
            for await (const token of responseStream) {
                fullText += token;
                onTokenCb(fullText);
            }
            return fullText;
        } catch (error) {
            console.error("GeminiAIService: Erro no streaming", error);
            throw error;
        }
    }

    async resetSession() {
        if (this.currentSession) {
            this.currentSession.destroy();
            this.currentSession = null;
        }
    }

    async updateSettings(settings) {
        const hasChanged = 
            settings.temperature !== this.settings.temperature ||
            settings.topK !== this.settings.topK ||
            settings.systemPrompt !== this.settings.systemPrompt;

        this.settings = { ...this.settings, ...settings };
        
        if (hasChanged) {
            await this.resetSession();
        }
    }

    async getSettings() {
        return { ...this.settings };
    }
}
