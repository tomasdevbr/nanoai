/**
 * Implementação do HistoryRepository usando IndexedDB.
 */
class IndexedDBRepository extends HistoryRepository {
    constructor(dbName = 'webai_history', version = 1) {
        super();
        this.dbName = dbName;
        this.version = version;
        this.storeName = 'conversations';
        this.db = null;
    }

    async _getDB() {
        if (this.db) return this.db;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            request.onsuccess = (e) => { this.db = e.target.result; resolve(this.db); };
            request.onerror = (e) => reject(e.target.error);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            };
        });
    }

    async save(data) {
        const db = await this._getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.add({ ...data, timestamp: Date.now() });
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    async getAll() {
        const db = await this._getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();
            request.onsuccess = () => {
                const sorted = request.result.sort((a, b) => b.timestamp - a.timestamp);
                resolve(sorted);
            };
            request.onerror = (e) => reject(e.target.error);
        });
    }

    async delete(id) {
        const db = await this._getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    }

    async clearAll() {
        const db = await this._getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    }
}
