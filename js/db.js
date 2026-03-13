// Configuração do IndexedDB
const DB_NAME = 'webai_history';
const DB_VERSION = 1;
const STORE_NAME = 'conversations';

let db;

// Inicializa o banco de dados
async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("Erro ao abrir o IndexedDB:", event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            // Cria a tabela (object store) com auto-incremento para ter IDs únicos
            const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            // Cria um índice para ordenar por data (se precisar depois)
            objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
    });
}

// Função para salvar uma conversa (pergunta e resposta)
async function saveConversation(question, answer) {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);
        
        const record = {
            question: question,
            answer: answer,
            timestamp: new Date().getTime()
        };

        const request = objectStore.add(record);

        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

// Função para recuperar o histórico de conversas
async function getHistory() {
    if (!db) await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.getAll();

        request.onsuccess = () => {
            // Ordena o resultado para que os mais recentes apareçam primeiro, se desejar
            const sortedResults = request.result.sort((a, b) => b.timestamp - a.timestamp);
            resolve(sortedResults);
        };
        request.onerror = (e) => reject(e.target.error);
    });
}

// Função para deletar uma conversa específica
async function deleteConversation(id) {
    if (!db) await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });
}
// Função para deletar todo o histórico
async function clearAllHistory() {
    if (!db) await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.clear();

        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });
}
