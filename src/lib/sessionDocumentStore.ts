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
  sessionId: string;
  updatedAt: number;
};

const DB_NAME = "nocturne_temp_reader";
const STORE_NAME = "documents";
const ACTIVE_ID = "active";
const SESSION_KEY = "nocturne_session_id";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

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

function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getSessionIdFromStorage(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function setSessionIdInStorage(sessionId: string) {
  try {
    sessionStorage.setItem(SESSION_KEY, sessionId);
  } catch {
    // Ignore storage exceptions in restrictive browsing environments.
  }
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

async function purgeOtherSessions(activeSessionId: string): Promise<void> {
  const db = await openDb();
  const record = await runTransaction<StoredDocument | undefined>(
    db,
    "readonly",
    (store) => store.get(ACTIVE_ID)
  );

  if (!record || record.sessionId === activeSessionId) return;

  await runTransaction(db, "readwrite", (store) => store.delete(ACTIVE_ID));
}

async function ensureSessionId(): Promise<string> {
  const existing = getSessionIdFromStorage();
  if (existing) return existing;

  const next = createSessionId();
  setSessionIdInStorage(next);
  await purgeOtherSessions(next);
  return next;
}

export async function saveActiveDocument(document: ActiveDocument): Promise<void> {
  const db = await openDb();
  const sessionId = await ensureSessionId();

  const payload: StoredDocument = {
    id: ACTIVE_ID,
    sessionId,
    updatedAt: Date.now(),
    ...document,
  };

  await runTransaction(db, "readwrite", (store) => store.put(payload));
}

export async function getActiveDocument(): Promise<ActiveDocument | null> {
  const db = await openDb();
  const sessionId = await ensureSessionId();
  const record = await runTransaction<StoredDocument | undefined>(
    db,
    "readonly",
    (store) => store.get(ACTIVE_ID)
  );

  if (!record) return null;
  if (record.sessionId !== sessionId) {
    await runTransaction(db, "readwrite", (store) => store.delete(ACTIVE_ID));
    return null;
  }

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
