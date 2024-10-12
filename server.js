/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const dotenv = require("dotenv");
dotenv.config();  // Load environment variables
const app = express();
const staticRoutes = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const baseController = require("./controllers/baseController");
const utilities = require("./utilities/");
const session = require("express-session");
const bodyParser = require("body-parser");
const pool = require('./database');  // Database connection pool
const flash = require('connect-flash');

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Middleware
 *************************/

// Ensure SESSION_SECRET is set, fallback if undefined
const sessionSecret = process.env.SESSION_SECRET || 'fallback-secret-key';  // Add fallback secret

// Setup session with PostgreSQL store
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,  // Use the pool defined in database.js
  }),
  secret: sessionSecret,  // Use the session secret
  resave: false,  // Optimize session saving by not saving unmodified sessions
  saveUninitialized: true,  // Save new, unmodified sessions
  name: 'sessionId',  // Custom session cookie name
  cookie: { secure: false }  // Set secure cookies in production (true for HTTPS)
}));

// Express Messages Middleware (Flash messages)
app.use(flash());
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Body parser middleware to handle JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

/* ***********************
 * Static Files
 *************************/
app.use(express.static('public'));

/* ***********************
 * Handle favicon.ico requests to avoid redundant session errors
 *************************/
app.get('/favicon.ico', (req, res) => res.status(204));  // No Content response

/* ***********************
 * Routes
 *************************/
app.use(staticRoutes);

// Index Route
app.get('/', utilities.handleErrors(baseController.buildHome));
app.use("/inv", utilities.handleErrors(inventoryRoute));

// Account Routes
app.use("/account", utilities.handleErrors(accountRoute));

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'});
});

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  const statusCode = err.status || 500;
  const message = statusCode === 404 ? err.message : 'Oh no! There was a crash. Maybe try a different route?';
  
  res.status(statusCode).render("errors/error", {
    title: statusCode === 404 ? '404 - Page Not Found' : 'Server Error',
    message,
    nav
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500;  // Fallback to 5500 if not set in .env
const host = process.env.HOST || 'localhost';  // Fallback to localhost if not set in .env

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`App listening on http://${host}:${port}`);
});
