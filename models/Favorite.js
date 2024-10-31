const pool = require('../database/');

module.exports = {
    async addFavorite(userId, vehicleId) {
        const sql = `INSERT INTO favorites (user_id, vehicle_id) VALUES ($1, $2) RETURNING *`;
        const result = await pool.query(sql, [userId, vehicleId]);
        return result.rows[0];
    },

    async removeFavorite(userId, vehicleId) {
        const sql = `DELETE FROM favorites WHERE user_id = $1 AND vehicle_id = $2`;
        await pool.query(sql, [userId, vehicleId]);
    },

    async getUserFavorites(userId) {
        const sql = `SELECT * FROM vehicles v JOIN favorites f ON v.vehicle_id = f.vehicle_id WHERE f.user_id = $1`;
        const result = await pool.query(sql, [userId]);
        return result.rows;
    }
};
