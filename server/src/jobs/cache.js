/**
 * Simple in-memory cache (replaces Redis for local dev / VPS without Redis)
 * TTL-based, per-key storage
 */
const store = new Map();

const setCache = (key, value, ttlSeconds = 300) => {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  store.set(key, { value, expiresAt });
};

const getCache = (key) => {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
};

const deleteCache = (key) => store.delete(key);

module.exports = { setCache, getCache, deleteCache };
