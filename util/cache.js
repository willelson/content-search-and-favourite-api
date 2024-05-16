const Redis = require('ioredis');
exports.redis = new Redis(6379, process.env.CACHE_NAME);
