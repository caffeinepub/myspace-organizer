// Lightweight native IndexedDB wrapper - replaces Dexie since it's not in package.json

const DB_NAME = 'MyOrganizerDB';
const DB_VERSION = 1;

const STORES: Record<string, string> = {
  notes: '++id, type, pinned, archived, trashed, createdAt, updatedAt',
  routines: '++id, profileType',
  records: '++id, createdAt, updatedAt',
  streak: '++id',
  quotes: '++id, isActive',
  labels: '++id, name',
  imageBlobs: '++id, key, type',
  settings: '++id, key',
};

let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      Object.keys(STORES).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
          // Create indexes based on store definition
          if (storeName === 'notes') {
            store.createIndex('type', 'type', { unique: false });
            store.createIndex('archived', 'archived', { unique: false });
            store.createIndex('trashed', 'trashed', { unique: false });
            store.createIndex('updatedAt', 'updatedAt', { unique: false });
          } else if (storeName === 'routines') {
            store.createIndex('profileType', 'profileType', { unique: false });
          } else if (storeName === 'records') {
            store.createIndex('createdAt', 'createdAt', { unique: false });
          } else if (storeName === 'quotes') {
            store.createIndex('isActive', 'isActive', { unique: false });
          } else if (storeName === 'labels') {
            store.createIndex('name', 'name', { unique: false });
          } else if (storeName === 'imageBlobs') {
            store.createIndex('key', 'key', { unique: false });
            store.createIndex('type', 'type', { unique: false });
          } else if (storeName === 'settings') {
            store.createIndex('key', 'key', { unique: false });
          }
        }
      });
    };
    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };
    request.onerror = () => reject(request.error);
  });
}

function idbRequest<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export class Table<T extends { id?: number }> {
  constructor(private storeName: string) {}

  private async getStore(mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    const db = await openDB();
    return db.transaction(this.storeName, mode).objectStore(this.storeName);
  }

  async add(item: Omit<T, 'id'>): Promise<number> {
    const store = await this.getStore('readwrite');
    const id = await idbRequest<IDBValidKey>(store.add(item));
    return id as number;
  }

  async put(item: T): Promise<number> {
    const store = await this.getStore('readwrite');
    const id = await idbRequest<IDBValidKey>(store.put(item));
    return id as number;
  }

  async get(id: number): Promise<T | undefined> {
    const store = await this.getStore('readonly');
    return idbRequest<T | undefined>(store.get(id));
  }

  async delete(id: number): Promise<void> {
    const store = await this.getStore('readwrite');
    await idbRequest<undefined>(store.delete(id));
  }

  async toArray(): Promise<T[]> {
    const store = await this.getStore('readonly');
    return idbRequest<T[]>(store.getAll());
  }

  async count(): Promise<number> {
    const store = await this.getStore('readonly');
    return idbRequest<number>(store.count());
  }

  async clear(): Promise<void> {
    const store = await this.getStore('readwrite');
    await idbRequest<undefined>(store.clear());
  }

  async bulkAdd(items: Array<Omit<T, 'id'>>): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(this.storeName, 'readwrite');
    const store = tx.objectStore(this.storeName);
    for (const item of items) {
      store.add(item);
    }
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Query helpers
  where(indexName: string) {
    return new WhereClause<T>(this.storeName, indexName);
  }

  orderBy(indexName: string) {
    return new OrderByClause<T>(this.storeName, indexName);
  }

  toCollection() {
    return new Collection<T>(this.storeName);
  }
}

class WhereClause<T extends { id?: number }> {
  constructor(private storeName: string, private indexName: string) {}

  equals(value: IDBValidKey) {
    return new FilteredCollection<T>(this.storeName, this.indexName, value);
  }
}

class FilteredCollection<T extends { id?: number }> {
  private filterFn: ((item: T) => boolean) | null = null;

  constructor(
    private storeName: string,
    private indexName: string,
    private value: IDBValidKey
  ) {}

  and(fn: (item: T) => boolean): this {
    this.filterFn = fn;
    return this;
  }

  async toArray(): Promise<T[]> {
    const db = await openDB();
    const store = db.transaction(this.storeName, 'readonly').objectStore(this.storeName);
    let results: T[];
    if (store.indexNames.contains(this.indexName)) {
      const index = store.index(this.indexName);
      results = await idbRequest<T[]>(index.getAll(this.value));
    } else {
      results = await idbRequest<T[]>(store.getAll());
      results = results.filter(item => (item as Record<string, unknown>)[this.indexName] === this.value);
    }
    if (this.filterFn) results = results.filter(this.filterFn);
    return results;
  }

  async first(): Promise<T | undefined> {
    const results = await this.toArray();
    return results[0];
  }

  async delete(): Promise<void> {
    const items = await this.toArray();
    const db = await openDB();
    const tx = db.transaction(this.storeName, 'readwrite');
    const store = tx.objectStore(this.storeName);
    for (const item of items) {
      if (item.id !== undefined) store.delete(item.id);
    }
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

class OrderByClause<T extends { id?: number }> {
  constructor(private storeName: string, private indexName: string) {}

  reverse() {
    return new SortedCollection<T>(this.storeName, this.indexName, true);
  }

  async toArray(): Promise<T[]> {
    return new SortedCollection<T>(this.storeName, this.indexName, false).toArray();
  }
}

class SortedCollection<T extends { id?: number }> {
  constructor(
    private storeName: string,
    private indexName: string,
    private reversed: boolean
  ) {}

  async toArray(): Promise<T[]> {
    const db = await openDB();
    const store = db.transaction(this.storeName, 'readonly').objectStore(this.storeName);
    let results: T[];
    if (store.indexNames.contains(this.indexName)) {
      const index = store.index(this.indexName);
      const direction: IDBCursorDirection = this.reversed ? 'prev' : 'next';
      results = await new Promise<T[]>((resolve, reject) => {
        const items: T[] = [];
        const req = index.openCursor(null, direction);
        req.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) { items.push(cursor.value as T); cursor.continue(); }
          else resolve(items);
        };
        req.onerror = () => reject(req.error);
      });
    } else {
      results = await idbRequest<T[]>(store.getAll());
      results.sort((a, b) => {
        const av = (a as Record<string, unknown>)[this.indexName] as number;
        const bv = (b as Record<string, unknown>)[this.indexName] as number;
        return this.reversed ? bv - av : av - bv;
      });
    }
    return results;
  }

  async first(): Promise<T | undefined> {
    const results = await this.toArray();
    return results[0];
  }
}

class Collection<T extends { id?: number }> {
  constructor(private storeName: string) {}

  async first(): Promise<T | undefined> {
    const db = await openDB();
    const store = db.transaction(this.storeName, 'readonly').objectStore(this.storeName);
    return new Promise<T | undefined>((resolve, reject) => {
      const req = store.openCursor();
      req.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        resolve(cursor ? (cursor.value as T) : undefined);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async toArray(): Promise<T[]> {
    const db = await openDB();
    const store = db.transaction(this.storeName, 'readonly').objectStore(this.storeName);
    return idbRequest<T[]>(store.getAll());
  }
}

export async function clearAllStores(): Promise<void> {
  const db = await openDB();
  const storeNames = Array.from(db.objectStoreNames);
  const tx = db.transaction(storeNames, 'readwrite');
  for (const name of storeNames) {
    tx.objectStore(name).clear();
  }
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
