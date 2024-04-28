const { IMAGE_TYPE, VIDEO_TYPE, RESULTS_PER_PAGE } = require('./constants');

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
    thumbnail: image.previewURL,
    contentURL: image.webformatURL,
    pixabayURL: image.pageURL
  }));

/**
 * Map video results to the unified content structure
 */
const structureVideoHits = (hits) =>
  hits.map((video) => ({
    pixabayId: video.id,
    contentType: VIDEO_TYPE,
    thumbnail: video.videos.medium.thumbnail,
    contentURL: video.videos.medium.url,
    pixabayURL: video.pageURL
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
exports.contentTypeValid = (contentType) =>
  [IMAGE_TYPE, VIDEO_TYPE].includes(contentType);

/**
 * Fetch content from Pixabay and structure response to send back to client
 */
exports.fetchContent = async (query, contentType, page) => {
  const url = buildPixabaySearchUrl(query, contentType, page);

  const response = await fetch(url);
  const data = await response.json();

  const { total, totalHits, hits } = data;

  const structuredContent = structurePixabayContent(contentType, hits);

  return {
    query,
    contentType,
    page,
    resultsPerPage: RESULTS_PER_PAGE,
    total,
    totalHits,
    content: structuredContent
  };
};

/**
 * Fetch content from Pixabay and structure response to send back to client
 *
 * returns null if content is not found on Pixabay
 */
exports.fetchContentById = async (id, contentType) => {
  const baseUrl = buildPixabayBaseUrl(contentType);
  const url = `${baseUrl}?key=${process.env.PIXABAY_API_KEY}&id=${id}`;

  const response = await fetch(url);

  // Return null if id returns no results
  if (response.status === 404) return null;

  const data = await response.json();
  const structuredContent = structurePixabayContent(contentType, data.hits);

  // After querying by ID we will only recieve 1 result
  return structuredContent[0];
};
