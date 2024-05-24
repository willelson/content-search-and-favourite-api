const { IMAGE_TYPE, VIDEO_TYPE, RESULTS_PER_PAGE } = require('./constants');
const { isValidInteger } = require('./password');
const { NotFoundError, BadRequestError } = require('./errors');
const { redis, checkCache } = require('./cache');

const buildPixabayBaseUrl = (contentType) => {
  let baseUrl = 'https://pixabay.com/api/';
  if (contentType === VIDEO_TYPE) {
    baseUrl += 'videos/';
  }

  return baseUrl;
};

/**
 * Build appriate URL for the content type
 */
const buildPixabaySearchUrl = (query, contentType, page) => {
  const baseUrl = buildPixabayBaseUrl(contentType);

  const formattedQuery = query.replace(' ', '+');
  let url = `${baseUrl}?key=${process.env.PIXABAY_API_KEY}&q=${formattedQuery}`;

  if (page) {
    url += `&page=${page}`;
  }

  return url;
};

/**
 * Map image results to the unified content structure
 */
const structureImageHits = (hits) =>
  hits.map((image) => ({
    pixabayId: image.id,
    contentType: IMAGE_TYPE,
    thumbnail: image.webformatURL,
    contentURL: image.webformatURL,
    pixabayURL: image.pageURL,
    userFavouriteId: null
  }));

/**
 * Map video results to the unified content structure
 */
const structureVideoHits = (hits) =>
  hits.map((video) => ({
    pixabayId: video.id,
    contentType: VIDEO_TYPE,
    thumbnail: video.videos.medium.thumbnail,
    contentURL: video.videos.medium.thumbnail,
    pixabayURL: video.pageURL,
    userFavouriteId: null
  }));

const structurePixabayContent = (contentType, hits) => {
  let structuredContent = [];
  if (contentType === VIDEO_TYPE) {
    structuredContent = structureVideoHits(hits);
  } else {
    structuredContent = structureImageHits(hits);
  }
  return structuredContent;
};

/**
 * Only valid content types are "image" or "video"
 */
const contentTypeValid = (contentType) =>
  [IMAGE_TYPE, VIDEO_TYPE].includes(contentType);

/**
 * Page can either be undefined or an integer
 */
const pageNumberValid = (page) => {
  return page === undefined || isValidInteger(page);
};

/**
 * Piabay ID must be an integer
 */
const pixabayIdValid = (id) => isValidInteger(id);

/**
 * Build cache key from query prameters
 *
 * @param {string} query
 * @param {string} contentType
 * @param {number} page
 * @returns {string} cache key
 */
const buildCacheKey = (query, contentType, page = 1) =>
  `query=${query}&contentType=${contentType}&page=${page}`;

/**
 * Fetch content from Pixabay and structure response to send back to client
 * throws NotFoundError if content is not found on Pixabay
 */
const fetchContent = async (query, contentType, page) => {
  const cacheKey = buildCacheKey(query, contentType, page);
  let data = await checkCache(cacheKey);

  if (data === null) {
    const url = buildPixabaySearchUrl(query, contentType, page);

    const response = await fetch(url);

    if (response.status === 400) {
      const message = await response.text();
      throw new BadRequestError(message);
    }

    if (response.status === 404) {
      const message = await response.text();
      throw new NotFoundError(message);
    }

    data = await response.json();
    await redis.set(cacheKey, JSON.stringify(data));
  }

  const { total, totalHits, hits } = data;

  const structuredContent = structurePixabayContent(contentType, hits);

  // Ensure page is returned as a number
  pageNumber = Number(page) || 1;

  return {
    query,
    contentType,
    page: pageNumber,
    resultsPerPage: RESULTS_PER_PAGE,
    total,
    totalHits,
    content: structuredContent
  };
};

/**
 * Fetch content from Pixabay and structure response to send back to client
 * throws NotFoundError if content is not found on Pixabay
 */
const fetchContentById = async (id, contentType) => {
  const baseUrl = buildPixabayBaseUrl(contentType);
  const url = `${baseUrl}?key=${process.env.PIXABAY_API_KEY}&id=${id}`;

  const response = await fetch(url);

  if (response.status === 400) {
    const message = await response.text();
    throw new BadRequestError(message);
  }

  if (response.status === 404) {
    const message = await response.text();
    throw new NotFoundError(message);
  }

  const data = await response.json();
  const structuredContent = structurePixabayContent(contentType, data.hits);

  // After querying by ID we will only recieve 1 result
  return structuredContent[0];
};

module.exports = {
  buildPixabayBaseUrl,
  checkCache,
  contentTypeValid,
  fetchContent,
  fetchContentById,
  pageNumberValid,
  pixabayIdValid
};
