const jwt = require('jsonwebtoken');

function setUser(req, res, next) {
  const token = req.cookies.jwt;
  if (token) {
    try {
      const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      res.locals.user = user;
    } catch (error) {
      console.error('Invalid token', error);
    }
  }
  next();
}

module.exports = setUser;