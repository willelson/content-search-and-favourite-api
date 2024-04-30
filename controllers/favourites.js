const User = require('../models/user');
const Favourite = require('../models/favourite');
const {
  fetchContentById,
  contentTypeValid,
  pageNumberValid,
  pixabayIdValid
} = require('../util/pixabay');
const { RESULTS_PER_PAGE } = require('../util/constants');

exports.getFavourites =
  ('',
  async (req, res, next) => {
    const page = req.query.page || 1;

    // Check page number is valid
    if (!pageNumberValid(page)) {
      res.status(400).json({ errors: ['page must be a valid number'] });
      return;
    }

    // Define offset to get results for requested page
    const offset = (page - 1) * RESULTS_PER_PAGE;

    const favourites = await req.user.getFavourites({
      offset,
      limit: RESULTS_PER_PAGE
    });

    const favouritesCount = await req.user.countFavourites();

    // Convert model data into structure to return to the client
    const favouritesContent = favourites.map((favourite) => {
      const data = favourite.toJSON();
      return {
        id: data.id,
        pixabayId: data.pixabay_id,
        contentType: data.content_type,
        thumbnail: data.thumbnail_url,
        contentURL: data.content_url,
        pixabayURL: data.pixabay_url
      };
    });

    const response = {
      total: favouritesCount,
      page,
      resultsPerPage: RESULTS_PER_PAGE,
      content: favouritesContent
    };

    res.status(200).json(response);
  });

exports.addFavourite =
  ('',
  async (req, res, next) => {
    // request body should include pixabay content ID
    const { pixabayId } = req.body;

    // Check required parameters are present
    if (!pixabayId || !req.body.contentType) {
      res.status(400).json({
        errors: ['pixabayId and contentType parameters are required']
      });
      return;
    }

    // Check content type is valid
    if (!contentTypeValid(req.body.contentType)) {
      res
        .status(400)
        .json({ errors: ['contentType must be either video or image'] });
      return;
    }

    // Check pixabayId is a valid number
    if (!pixabayIdValid(pixabayId)) {
      res.status(400).json({ errors: ['pixabayId must be a valid integer'] });
      return;
    }

    // Check if a favourite with this ID already exists in the table
    let favourite = await Favourite.findOne({
      where: { pixabay_id: pixabayId, content_type: req.body.contentType }
    });

    // If not, fetch content data from Pixabay api
    let favouriteData = {};
    if (!favourite) {
      const favouriteData = await fetchContentById(
        pixabayId,
        req.body.contentType
      );

      // Return a 404 if no result comes back from Pixabay
      if (!favouriteData) {
        console.log('no fav data');
        res.status(404).json({ errors: ['Content not found'] });
        return;
      }

      const { contentType, thumbnail, contentURL, pixabayURL } = favouriteData;

      favourite = await Favourite.create({
        pixabay_id: pixabayId,
        content_type: contentType,
        thumbnail_url: thumbnail,
        content_url: contentURL,
        pixabay_url: pixabayURL
      });
    }

    // Add favourite to the users favourites
    await req.user.addFavourite(favourite);

    // TODO return newly created object as json
    const msg = `Favourite content (id: ${favourite.pixabay_id}, type: ${favourite.content_type}) successfully added for user ${req.user.email}`;
    res.status(201).json({ message: msg });
  });

exports.deleteFavourite =
  ('',
  async (req, res, next) => {
    const { favouriteId } = req.params;

    // TODO Check favouriteId is pass and is a valid number

    // Find record in database with favouriteId
    const favourite = await Favourite.findOne({
      where: { id: parseInt(favouriteId) }
    });

    // Check the favourite exists
    if (!favourite) {
      res.status(404).json({ errors: ['Content not found'] });
      return;
    }

    // Check user has this favourite
    const userHasFavourite = await req.user.hasFavourite(favourite);
    if (!favourite) {
      res.status(404).json({ errors: ['Content not found'] });
      return;
    }

    req.user.removeFavourite(favourite);

    res.status(202).send();
  });
