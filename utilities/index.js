const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data) {
  let grid = ''; 
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach(vehicle => { 
      grid += '<li>';
      grid += '<a href="/inv/vehicle/' + vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' details"><img src="' 
        + vehicle.inv_thumbnail + '" alt="Image of ' + vehicle.inv_make + ' ' 
        + vehicle.inv_model + ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += '<hr />';
      grid += '<h2>';
      grid += '<a href="/inv/vehicle/' + vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>';
      grid += '</h2>';
      grid += '<span>$' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>';
      grid += '</div>';
      grid += '</li>';
    });
    grid += '</ul>';
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

Util.formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

Util.formatMiles = (miles) => {
  return miles.toLocaleString() + ' miles';
};

Util.getReferer = (req) => {
  return req.headers.referer || '/';
};

Util.buildVehicleDetail = (vehicle, req) => {
  return `
    <div class="vehicle-detail-container">
      <div class="vehicle-image">
        <img src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${vehicle.inv_model}">
      </div>
      <div class="vehicle-info">
        <h1>${vehicle.inv_make} ${vehicle.inv_model} ${vehicle.inv_year}</h1>
        <p><strong>Price:</strong> ${Util.formatCurrency(vehicle.inv_price)}</p> 
        <p><strong>Mileage:</strong> ${Util.formatMiles(vehicle.inv_miles)}</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <p><strong>Classification:</strong> ${vehicle.classification_name}</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
      </div>
    </div>
    <a href="${Util.getReferer(req)}">Back to Inventory</a>
  `;
};

Util.buildClassificationList = async function () {
  let data = await invModel.getClassifications();
  let classificationList = [];

  data.rows.forEach((row) => {
      classificationList.push({
          id: row.classification_id,
          name: row.classification_name
      });
  });

  return classificationList;
};

Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, account) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.account = account
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
}

Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

/* **************************************** 
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util