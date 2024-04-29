const {
  fetchContent,
  contentTypeValid,
  pageNumberValid
} = require('../util/pixabay');

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
    try {
      const { query, contentType, page } = req.query;

      // Check required parameters are present
      if (!query || !contentType) {
        res
          .status(400)
          .json({ errors: ['query and contentType parameters are required'] });
        return;
      }

      // Check content type is valid
      if (!contentTypeValid(contentType)) {
        res
          .status(400)
          .json({ errors: ['contentType must be either video or image'] });
        return;
      }

      // Check page number is valid
      if (!pageNumberValid(page)) {
        res.status(400).json({ errors: ['page must be a valid number'] });
        return;
      }

      const data = await fetchContent(query, contentType, page);
      res.status(200).json(data);
    } catch (err) {
      console.log(err);
      res.status(500).send();
    }
  });
