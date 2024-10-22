const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require('../utilities/account-validation')

router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))
router.post(
    '/register', regValidate.registrationRules(),
    regValidate.checkRegData, utilities.handleErrors(accountController.registerAccount))

// Process the login attempt
router.post(
    "/login", 
     utilities.handleErrors(accountController.loginAccount))

router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildLoginDashboard))
router.get('/logout', utilities.handleErrors(accountController.logoutAccount));
router.get('/update/:id', utilities.handleErrors(accountController.getUpdateView));
router.post('/update', regValidate.updateAccountRules(), regValidate.checkAccountUpdateData, utilities.handleErrors(accountController.updateAccount));
router.post('/change-password', regValidate.updatePasswordRules(), regValidate.checkPasswordUpdateData, utilities.handleErrors(accountController.changePassword));

module.exports = router