const Favorite = require('../models/Favorite');

exports.addFavorite = async (req, res, next) => {
    try {
        const userId = req.session.userId;  // Assuming user ID is stored in session
        const vehicleId = req.body.vehicleId;

        await Favorite.addFavorite(userId, vehicleId);
        req.flash('success', 'Vehicle added to favorites');
        res.redirect('/path/to/vehicle/page');
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.removeFavorite = async (req, res, next) => {
    try {
        const userId = req.session.userId;
        const vehicleId = req.body.vehicleId;

        await Favorite.removeFavorite(userId, vehicleId);
        req.flash('success', 'Vehicle removed from favorites');
        res.redirect('/path/to/vehicle/page');
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.getFavorites = async (req, res, next) => {
    try {
        const userId = req.session.userId;
        const favorites = await Favorite.getUserFavorites(userId);

        res.render('favorites', { title: 'My Favorites', favorites });
    } catch (error) {
        console.error(error);
        next(error);
    }
};
