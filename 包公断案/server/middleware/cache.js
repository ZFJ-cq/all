const config = require('../config');

const cacheStore = new Map();

function getCacheKey(prefix, id) {
  return `${prefix}:${id}`;
}

function getFromCache(key) {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > config.cacheTTL) {
    cacheStore.delete(key);
    return null;
  }
  return entry.data;
}

function setToCache(key, data) {
  cacheStore.set(key, { data, timestamp: Date.now() });
}

function clearCache(prefix) {
  if (prefix) {
    for (const key of cacheStore.keys()) {
      if (key.startsWith(prefix + ':')) {
        cacheStore.delete(key);
      }
    }
  } else {
    cacheStore.clear();
  }
}

function getCacheStats() {
  return {
    size: cacheStore.size,
    keys: Array.from(cacheStore.keys())
  };
}

module.exports = { getCacheKey, getFromCache, setToCache, clearCache, getCacheStats };