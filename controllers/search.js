const {
  fetchContent,
  contentTypeValid,
  pageNumberValid
} = require('../util/pixabay');
const { Op } = require('sequelize');

/**
 * Controller for searching the Pixabay api
 *
 * Expects the following query params
 * - query @required - used to query the Pixabay api for content
 * - contentType @required - type of content to fetch from Pixabay must only be 'image' or 'video'
 * - page - page number
 */
exports.search = async (req, res, next) => {
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

  try {
    const data = await fetchContent(query, contentType, page, next);
    const { content } = data;

    // Get Pixabay Ids from search results
    const pixabayIds = content.map((c) => c.pixabayId);

    // Check if user has already favourited any items in the search results
    const userFavourites = await req.user.getFavourites({
      where: {
        pixabay_id: {
          [Op.in]: pixabayIds
        },
        content_type: {
          [Op.eq]: contentType
        }
      }
    });

    userFavourites.forEach((favourite) => {
      const favouriteData = favourite.toJSON();
      // Find the favourite in data.content
      const index = content.findIndex(
        (item) => item.pixabayId === favouriteData.pixabay_id
      );

      // Set the userFavouriteId
      content[index].userFavouriteId = favouriteData.id;
    });

    res.status(200).json(data);
  } catch (err) {
    return next(err);
  }
};
