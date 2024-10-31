const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoritesController');


router.post('/add', favoritesController.addFavorite);
router.post('/remove', favoritesController.removeFavorite);
router.get('/', favoritesController.getFavorites);

module.exports = router;
