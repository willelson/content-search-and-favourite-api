const { authenticate } = require('../middleware/auth');
const {
  getFavourites,
  addFavourite,
  deleteFavourite
} = require('../controllers/favourites');
const router = require('express').Router();

router.use(authenticate);
router.get('/', getFavourites);
router.post('/', addFavourite);
router.delete('/:favouriteId', deleteFavourite);

module.exports = router;
