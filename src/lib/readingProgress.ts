const PREFIX = "nocturne_progress_";
const MAX_ENTRIES = 20;
const INDEX_KEY = "nocturne_progress_index";

export type ReadingProgress = {
  filename: string;
  scrollPercent: number;
  savedAt: number;
};

function getKey(filename: string): string {
  return PREFIX + encodeURIComponent(filename);
}

function getIndex(): string[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function setIndex(index: string[]): void {
  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
}

export function saveProgress(filename: string, scrollPercent: number): void {
  if (typeof window === "undefined") return;

  try {
    const key = getKey(filename);
    const entry: ReadingProgress = {
      filename,
      scrollPercent: Math.min(100, Math.max(0, scrollPercent)),
      savedAt: Date.now(),
    };

    localStorage.setItem(key, JSON.stringify(entry));

    // Update index, keep filename at front, cap at MAX_ENTRIES
    const index = getIndex().filter((f) => f !== filename);
    index.unshift(filename);
    if (index.length > MAX_ENTRIES) {
      // Remove oldest entries
      const removed = index.splice(MAX_ENTRIES);
      removed.forEach((f) => localStorage.removeItem(getKey(f)));
    }

    setIndex(index);
  } catch {
    // Storage full or unavailable - silent fail
  }
}

export function loadProgress(filename: string): ReadingProgress | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(getKey(filename));
    if (!raw) return null;
    return JSON.parse(raw) as ReadingProgress;
  } catch {
    return null;
  }
}

export function clearProgress(filename: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(getKey(filename));
    const index = getIndex().filter((f) => f !== filename);
    setIndex(index);
  } catch {}
}

export function getLastRead(): ReadingProgress | null {
  if (typeof window === "undefined") return null;

  try {
    const index = getIndex();
    if (index.length === 0) return null;

    const raw = localStorage.getItem(getKey(index[0]));
    if (!raw) return null;
    return JSON.parse(raw) as ReadingProgress;
  } catch {
    return null;
  }
}
