const accountModel = require("../models/account-model");
const utilities = require("../utilities/");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

// Helper function to generate JWT tokens
const generateToken = (account) => {
  return jwt.sign(account, process.env.ACCESS_TOKEN_SECRET || 'c294f3cc356a0646a58883a179b', { expiresIn: '1h' });
};

// Helper function to verify JWT tokens
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};

async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(account_password, 12); // 12 salt rounds for better security

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
      return res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
      });
    } else {
      req.flash("notice", "Sorry, registration failed.");
      return res.status(500).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    req.flash("notice", "There was an error during registration.");
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function loginAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  try {
    const account = await accountModel.getAccountByEmail(account_email);
    if (!account) {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }

    const passwordMatch = await bcrypt.compare(account_password, account.account_password);
    if (passwordMatch) {
      delete account.account_password;

      const accessToken = generateToken(account);

      const cookieOptions = {
        httpOnly: true,
        maxAge: 3600 * 1000, // 1 hour in milliseconds
        secure: process.env.NODE_ENV !== 'development', // Ensure secure cookies in production
      };

      res.cookie("jwt", accessToken, cookieOptions);

      req.user = account; // Set user on the request

      return res.redirect("/account/");
    } else {
      req.flash("notice", "Invalid password. Please try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).send("An error occurred during login.");
  }
}

/* ****************************************
 *  Build Dashboard (Protected Route)
 * ************************************ */
async function buildLoginDashboard(req, res, next) {
  let nav = await utilities.getNav();

  const token = req.cookies.jwt;
  if (!token) {
    req.flash('notice', 'You must be logged in to access the dashboard.');
    return res.redirect('/account/login');
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    req.flash('notice', 'Session expired. Please log in again.');
    return res.redirect('/account/login');
  }

  try {
    res.render("account/dashboard", {
      title: "Account Management",
      nav,
      account_firstname: decoded.account_firstname,
      account_type: decoded.account_type,
      errors: null,
    });
  } catch (error) {
    console.error("Error building dashboard:", error);
    req.flash('error', 'An error occurred while loading the dashboard.');
    return res.redirect('/account/login');
  }
}

/* ****************************************
 *  Logout Functionality
 * ************************************ */
async function logoutAccount(req, res) {
  try {
    res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV !== 'development' });

    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.redirect('/');
      }
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  } catch (error) {
    console.error('Unexpected error during logout:', error);
    res.redirect('/');
  }
}

/* ****************************************
 *  Update Account Information
 * ************************************ */
async function getUpdateView(req, res) {
  let nav = await utilities.getNav();
  const accountId = req.params.id;

  try {
    const account = await accountModel.getAccountById(accountId);
    if (!account) {
      req.flash("notice", "Account not found.");
      return res.redirect("/account");
    }

    res.render("account/update-account", {
      title: "Update Account",
      nav,
      account_id: account.account_id,
      account_firstname: account.account_firstname,
      account_lastname: account.account_lastname,
      account_email: account.account_email,
      errors: null,
    });
  } catch (error) {
    console.error("Error rendering update account view:", error);
    req.flash("error", "An error occurred while loading the update account page.");
    return res.redirect("/account");
  }
}

/* ****************************************
 *  Update Account Functionality
 * ************************************ */
async function updateAccount(req, res) {
  try {
    const account = {
      account_firstname: req.body.firstname,
      account_lastname: req.body.lastname,
      account_email: req.body.email,
      account_id: req.body.account_id,
    };

    const updateResult = await accountModel.updateAccount(account);
    if (updateResult) {
      req.flash('notice', 'Account updated successfully.');
      return res.redirect('/account');
    } else {
      req.flash('error', 'Failed to update account.');
      return res.redirect(`/account/update/${account.account_id}`);
    }
  } catch (error) {
    console.error("Error updating account:", error);
    req.flash('error', 'Error updating account.');
    return res.redirect(`/account/update/${req.body.account_id}`);
  }
}

/* ****************************************
 *  Change Password Functionality
 * ************************************ */
async function changePassword(req, res) {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 12); // Re-hash password before saving
    const passwordChangeResult = await accountModel.updatePassword(req.body.account_id, hashedPassword);
    
    if (passwordChangeResult) {
      req.flash('notice', 'Password updated successfully.');
      return res.redirect('/account');
    } else {
      req.flash('error', 'Failed to update password.');
      return res.redirect(`/account/update/${req.body.account_id}`);
    }
  } catch (error) {
    console.error("Error updating password:", error);
    req.flash('error', 'Error updating password.');
    return res.redirect(`/account/update/${req.body.account_id}`);
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  loginAccount,
  buildLoginDashboard,
  logoutAccount,
  getUpdateView,
  updateAccount,
  changePassword,
};
