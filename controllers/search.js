/**
 * Possible query parameters
 * - query - REQUIRED used to query the Pixabay api for content
 * - contentType REQUIRED - type of content to fetch from Pixabay
 * - page - page number
 */

exports.search =
  ('',
  async (req, res, next) => {
    res.status(200).send('search route...');
  });
