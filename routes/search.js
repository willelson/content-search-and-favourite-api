const auth = require('../middleware/auth');
const { search } = require('../controllers/search');
const router = require('express').Router();

router.use(auth.authenticate);
router.get('', search);

module.exports = router;
