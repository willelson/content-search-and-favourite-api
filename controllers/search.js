const RESULTS_PER_PAGE = 20;
const IMAGE_TYPE = 'image';
const VIDEO_TYPE = 'video';

/**
 * Only valid content types are "image" or "video"
 */
const contentTypeValid = (contentType) =>
  [IMAGE_TYPE, VIDEO_TYPE].includes(contentType);

/**
 * Page can either be null or an integer
 */
const pageNumberValid = (page) => {
  return page === null || /^\d+$/.test(page);
};

/**
 * Build appriate URL for the content type
 */
const buildPixabayUrl = (query, contentType, page) => {
  let baseUrl = 'https://pixabay.com/api/';
  if (contentType === VIDEO_TYPE) {
    baseUrl += 'videos/';
  }

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

/**
 * Fetch content from Pixabay and structure response to send back to client
 */
const fetchContent = async (query, contentType, page) => {
  const url = buildPixabayUrl(query, contentType, page);

  const response = await fetch(url);
  const data = await response.json();

  const { total, totalHits, hits } = data;

  let structuredContent = [];
  if (contentType === VIDEO_TYPE) {
    structuredContent = structureVideoHits(hits);
  } else {
    structuredContent = structureImageHits(hits);
  }

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
 * Controller for searching the Pixabay api
 *
 * Expects the following query params
 * - query @required - used to query the Pixabay api for content
 * - contentType @required - type of content to fetch from Pixabay must only be 'image' or 'video'
 * - page - page number
 */
exports.search =
  ('',
  async (req, res, next) => {
    const { query, contentType, page } = req.query;

    // Check required parameters are present
    if (!query || !contentType) {
      res.status(400).send('query and contentType parameters are required');
      return;
    }

    // Check content type is valid
    if (!contentTypeValid(contentType)) {
      res.status(400).send('contentType must be either video or image');
      return;
    }

    // Check page number is valid
    if (!pageNumberValid(page)) {
      res.status(400).send('page must be a valid number');
      return;
    }

    const data = await fetchContent(query, contentType, page);
    res.status(200).json(data);
  });
