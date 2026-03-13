/**
 * Interface (Classe Base) para o Repositório de Histórico.
 * Segue o Princípio da Inversão de Dependência (DIP).
 */
class HistoryRepository {
    async save(conversation) {
        throw new Error("Método save deve ser implementado.");
    }

    async getAll() {
        throw new Error("Método getAll deve ser implementado.");
    }

    async delete(id) {
        throw new Error("Método delete deve ser implementado.");
    }

    async clearAll() {
        throw new Error("Método clearAll deve ser implementado.");
    }
}
