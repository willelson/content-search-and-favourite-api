const Redis = require('ioredis');
const redis = new Redis(6379, process.env.CACHE_NAME);
exports.redis = redis;

/**
 * Check if key is stored in the cache
 *
 * @param {string} cacheKey
 * @return {object|null}
 */
exports.checkCache = async (cacheKey) => {
  const result = await redis.get(cacheKey, (err, result) => {
    if (err) {
      console.error(err);
      return null;
    } else {
      return result;
    }
  });

  if (result === null) return null;
  else return JSON.parse(result);
};
