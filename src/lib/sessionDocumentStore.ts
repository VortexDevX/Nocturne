"use client";

export type DocumentFormat = "txt" | "epub";

export type ActiveDocument = {
  content: string;
  filename: string;
  format: DocumentFormat;
  encoding?: string;
};

type StoredDocument = ActiveDocument & {
  id: "active";
  savedAt: number;
};

const DB_NAME = "nocturne_reader";
const STORE_NAME = "documents";
const ACTIVE_ID = "active";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

function runTransaction<T>(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const request = action(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveActiveDocument(
  document: ActiveDocument
): Promise<void> {
  const db = await openDb();

  const payload: StoredDocument = {
    id: ACTIVE_ID,
    savedAt: Date.now(),
    ...document,
  };

  await runTransaction(db, "readwrite", (store) => store.put(payload));
}

export async function getActiveDocument(): Promise<ActiveDocument | null> {
  const db = await openDb();

  const record = await runTransaction<StoredDocument | undefined>(
    db,
    "readonly",
    (store) => store.get(ACTIVE_ID)
  );

  if (!record) return null;

  return {
    content: record.content,
    filename: record.filename,
    format: record.format,
    encoding: record.encoding,
  };
}

export async function clearActiveDocument(): Promise<void> {
  const db = await openDb();
  await runTransaction(db, "readwrite", (store) => store.delete(ACTIVE_ID));
}
