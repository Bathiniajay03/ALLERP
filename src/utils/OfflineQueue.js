const DB_NAME = 'WmsOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'scanQueue';

class OfflineQueue {
  constructor() {
    this.db = null;
    this.initDB();
  }

  initDB() {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      this.db = e.target.result;
      if (!this.db.objectStoreNames.contains(STORE_NAME)) {
        this.db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = (e) => {
      this.db = e.target.result;
    };
  }

  async enqueue(action, endpoint, data) {
    if (!this.db) return;
    const tx = this.db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.add({ action, endpoint, data, timestamp: Date.now() });
    
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
    });
  }

  async getAll() {
    if (!this.db) return [];
    return new Promise((resolve) => {
      const tx = this.db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  }

  async remove(id) {
    if (!this.db) return;
    const tx = this.db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
  }
}

export const offlineQueue = new OfflineQueue();
