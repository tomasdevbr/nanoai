/**
 * Interface (Classe Base) para o Serviço de IA.
 * Segue o Princípio da Inversão de Dependência (DIP).
 */
class AIService {
    async checkAvailability() {
        throw new Error("Método checkAvailability deve ser implementado.");
    }

    async generateResponse(content, onTokenCb) {
        throw new Error("Método generateResponse deve ser implementado.");
    }

    async resetSession() {
        throw new Error("Método resetSession deve ser implementado.");
    }

    async updateSettings(settings) {
        throw new Error("Método updateSettings deve ser implementado.");
    }

    async getSettings() {
        throw new Error("Método getSettings deve ser implementado.");
    }

    async getSession(onProgress) {
        throw new Error("Método getSession deve ser implementado.");
    }
}
