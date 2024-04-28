const User = require('../models/user');
const Favourite = require('../models/favourite');
const { fetchContentById, contentTypeValid } = require('../util/pixabay');

exports.getFavourites =
  ('',
  async (req, res, next) => {
    // TODO support pagination
    const favourites = await req.user.getFavourites();

    const response = favourites.map((favourite) => {
      const data = favourite.toJSON();
      return {
        pixabayId: data.pixabay_id,
        contentType: data.content_type,
        thumbnail: data.thumbnail_url,
        contentURL: data.content_url,
        pixabayURL: data.pixabay_url
      };
    });

    res.status(200).json(response);
  });

exports.addFavourite =
  ('',
  async (req, res, next) => {
    // request body should include favourite ID
    const { contentId } = req.body;

    // Check required parameters are present
    if (!contentId || !req.body.contentType) {
      res.status(400).send('contentId and contentType parameters are required');
      return;
    }

    // Check content type is valid
    if (!contentTypeValid(req.body.contentType)) {
      res.status(400).send('contentType must be either video or image');
      return;
    }

    // TODO Check contentId is a valid number

    // Check if a favourite with this ID already exists in the table
    let favourite = await Favourite.findOne({
      where: { pixabay_id: contentId, content_type: req.body.contentType }
    });

    // If not, fetch content data from Pixabay api
    if (!favourite) {
      console.log('need to fetch this favourite from the api');
      const favouriteData = await fetchContentById(
        contentId,
        req.body.contentType
      );

      // Return a 404 if no result comes back from Pixabay
      if (!favouriteData) {
        res.status(404).send('Content not found');
        return;
      }

      const { pixabayId, contentType, thumbnail, contentURL, pixabayURL } =
        favouriteData;

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

    const msg = `Favourite content (id: ${favourite.pixabay_id}, type: ${favourite.contentType}) successfully added for user ${req.user.email}`;
    res.status(201).send(msg);
  });

exports.deleteFavourite =
  ('',
  async (req, res, next) => {
    console.log(`Delete a favourite for authenticated user: ${req.user.email}`);
    res.status(200).send('test');
  });
