const cache = require('../cache');

jest.mock('../cache', () => ({
  checkCache: jest.fn()
}));

const { fetchContentById, fetchContent } = require('../pixabay');
const { NotFoundError, BadRequestError } = require('../errors');

const mockApiResponse = {
  total: 35615,
  totalHits: 500,
  hits: [
    {
      id: 7019264,
      pageURL:
        'https://pixabay.com/photos/flower-petal-wet-macro-tulip-7019264/',
      type: 'photo',
      tags: 'flower, petal, wet',
      previewURL:
        'https://cdn.pixabay.com/photo/2022/02/17/18/22/flower-7019264_150.jpg',
      previewWidth: 150,
      previewHeight: 100,
      webformatURL:
        'https://pixabay.com/get/ge2de3b900ba423111a8998915cdc1b36ab217faf780bcecfdacc0cb5e56d178151bbc4f926da9e9a736798e95a615703_640.jpg',
      webformatWidth: 640,
      webformatHeight: 427,
      largeImageURL:
        'https://pixabay.com/get/gf32cc5e3d2463cfa3c0dc09393becaef93eb3502c250475274cd955b96b0781b0cd8546ece14e647ce2efe8e120a98c40a6e40d5a333866be385b5193314c549_1280.jpg',
      imageWidth: 6001,
      imageHeight: 4000,
      imageSize: 3386198,
      views: 25700,
      downloads: 21442,
      collections: 68,
      likes: 138,
      comments: 24,
      user_id: 19662978,
      user: 'angelicavaihel',
      userImageURL:
        'https://cdn.pixabay.com/user/2021/03/15/08-35-41-698_250x250.png'
    },
    {
      id: 8609277,
      pageURL:
        'https://pixabay.com/photos/magnolia-flowers-white-flowers-8609277/',
      type: 'photo',
      tags: 'magnolia, flowers, white flowers',
      previewURL:
        'https://cdn.pixabay.com/photo/2024/03/02/19/30/magnolia-8609277_150.jpg',
      previewWidth: 150,
      previewHeight: 100,
      webformatURL:
        'https://pixabay.com/get/gf0bebc19b5be6cf6773f766ad861194dd676990466706b5d861056b807b2c4b5b0f57b6e5d8847c2b9a31aa5667dd53e_640.jpg',
      webformatWidth: 640,
      webformatHeight: 426,
      largeImageURL:
        'https://pixabay.com/get/ga9709901e12a928a0e2f0bfcb16aa19547877bf1c9a52da10f4022793d3d922927d46ade0690c1513a3c8cf8fdfc44f58f6421ef392dee759b6264e63cc6f463_1280.jpg',
      imageWidth: 3937,
      imageHeight: 2619,
      imageSize: 1166589,
      views: 15827,
      downloads: 13443,
      collections: 38,
      likes: 101,
      comments: 10,
      user_id: 13713779,
      user: 'MARTINOPHUC',
      userImageURL:
        'https://cdn.pixabay.com/user/2022/03/29/18-54-58-161_250x250.jpg'
    }
  ]
};

describe('pixabay.fetchContentById', () => {
  afterEach(() => {
    fetch.resetMocks();
  });

  test('throws NotFoundError error when Pixabay returns a 404', async () => {
    const id = 2342;
    const contentType = 'image';

    const responseMessage = `[ERROR] ${contentType} ${id} does not exist`;
    fetchResponse = new Promise((resolve, reject) => {
      resolve({
        status: 404,
        body: responseMessage
      });
    });
    fetch.mockResponse(() => fetchResponse);

    try {
      const data = await fetchContentById(id, contentType);
    } catch (err) {
      expect(err instanceof NotFoundError).toBe(true);
      expect(err.message).toBe(responseMessage);
    }
  });

  test('throws BadRequestError error when Pixabay returns a 400', async () => {
    const id = 2342;
    const contentType = 'image';

    const responseMessage = `[ERROR] ${contentType} ${id} does not exist`;
    fetchResponse = new Promise((resolve, reject) => {
      resolve({
        status: 400,
        body: responseMessage
      });
    });
    fetch.mockResponse(() => fetchResponse);

    try {
      const data = await fetchContentById(id, contentType);
    } catch (err) {
      expect(err instanceof BadRequestError).toBe(true);
      expect(err.message).toBe(responseMessage);
    }
  });

  test('returns content from pixabay in expected format', async () => {
    const id = 2342;
    const contentType = 'image';

    fetch.mockResponseOnce(JSON.stringify(mockApiResponse));

    const data = await fetchContentById(id, contentType);
    expect(data && typeof data === 'object').toBe(true);
    expect(Object.keys(data)).toContain('pixabayId');
  });
});

describe('pixabay.fetchContent', () => {
  afterEach(() => {
    fetch.resetMocks();
    cache.checkCache.mockReset();
  });

  test('throws NotFoundError error when Pixabay returns a 404', async () => {
    const page = 2;
    const query = 'test';
    const contentType = 'image';

    cache.checkCache.mockResolvedValue(null);

    const responseMessage = '[ERROR] 404 Not found';
    fetchResponse = new Promise((resolve, reject) => {
      resolve({
        status: 404,
        body: responseMessage
      });
    });
    fetch.mockResponse(() => fetchResponse);

    try {
      const data = await fetchContent(query, contentType, page);
    } catch (err) {
      expect(err instanceof NotFoundError).toBe(true);
      expect(err.message).toBe(responseMessage);
    }
  });

  test('throws BadRequestError error when Pixabay returns a 400', async () => {
    const query = 'test';
    const contentType = 'image';

    cache.checkCache.mockResolvedValue(null);

    const responseMessage = '[ERROR] 400 Bad request';
    fetchResponse = new Promise((resolve, reject) => {
      resolve({
        status: 400,
        body: responseMessage
      });
    });
    fetch.mockResponse(() => fetchResponse);

    try {
      const data = await fetchContent(query, contentType);
    } catch (err) {
      expect(err instanceof BadRequestError).toBe(true);
      expect(err.message).toBe(responseMessage);
    }
  });

  test('returns cached data and does not make request to pixabay after cache hit', async () => {
    const query = 'test';
    const contentType = 'image';
    cache.checkCache.mockResolvedValue(mockApiResponse);

    const data = await fetchContent(query, contentType);

    // Expect data to contain structured version of mockApiResponse
    expect(data.content.length).toEqual(2);
    expect(data.content[0].pixabayId).toBe(7019264);
    expect(data.content[1].pixabayId).toBe(8609277);

    // Expect checkCache to have been called
    expect(cache.checkCache.mock.calls.length).toEqual(1);

    // Excpect fetch to not have been called
    expect(fetch.mock.calls.length).toEqual(0);
  });
});
