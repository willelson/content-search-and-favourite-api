// Mock Redis class from ioredis so connection is not attempted when running tests.

class Redis {
  constructor(port, host) {}

  async get(key) {
    return null;
  }
}

module.exports = Redis;
