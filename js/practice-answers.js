/** 練習答案只放在這個瀏覽器。不寫入 Firebase，也不含螢光筆。 */

const STATUSES = new Set(['correct', 'incorrect', 'katakana', 'invalid']);

function storageKey(uid) {
  return `jvn.practice-answers.v1.${uid}`;
}

function readAll(uid) {
  if (!uid) return {};
  try {
    const raw = localStorage.getItem(storageKey(uid));
    const data = raw ? JSON.parse(raw) : {};
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
}

function writeAll(uid, data) {
  if (!uid) return;
  try {
    localStorage.setItem(storageKey(uid), JSON.stringify(data));
  } catch {
    /* 空間不足時保留畫面上的答案，不影響單字本。 */
  }
}

function cleanAnswer(item) {
  if (!item || typeof item !== 'object') return null;
  const value = String(item.value ?? '');
  const status = STATUSES.has(item.status) ? item.status : '';
  if (!value && !status) return null;
  return { value, status, message: String(item.message ?? '') };
}

export function loadPracticeAnswers(uid, notebookId) {
  if (!uid || !notebookId) return {};
  const book = readAll(uid)[notebookId];
  if (!book || typeof book !== 'object' || Array.isArray(book)) return {};
  const answers = {};
  Object.entries(book).forEach(([wordId, item]) => {
    const cleaned = cleanAnswer(item);
    if (wordId && cleaned) answers[wordId] = cleaned;
  });
  return answers;
}

export function savePracticeAnswers(uid, notebookId, answers) {
  if (!uid || !notebookId) return;
  const all = readAll(uid);
  const book = { ...(all[notebookId] && typeof all[notebookId] === 'object' ? all[notebookId] : {}) };
  Object.entries(answers || {}).forEach(([wordId, item]) => {
    if (!wordId) return;
    const cleaned = cleanAnswer(item);
    if (cleaned) book[wordId] = cleaned;
    else delete book[wordId];
  });
  all[notebookId] = book;
  writeAll(uid, all);
}

export function forgetPracticeAnswer(uid, notebookId, wordId) {
  if (!uid || !notebookId || !wordId) return;
  const all = readAll(uid);
  const book = all[notebookId];
  if (!book || typeof book !== 'object') return;
  delete book[wordId];
  writeAll(uid, all);
}

export function clearPracticeAnswers(uid, notebookId) {
  if (!uid || !notebookId) return;
  const all = readAll(uid);
  delete all[notebookId];
  writeAll(uid, all);
}
