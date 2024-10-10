// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const errorController = require("../controllers/errorController");
const utilities = require("../utilities/")
const regValidate = require('../utilities/account-validation')

// Route to build inventory by classification view
router.get("/", utilities.handleErrors(invController.managementView));
router.get("/add-classification", utilities.handleErrors(invController.addClassificationView));
router.post("/add-classification", regValidate.addClassification(), regValidate.checkClassificationRegData, utilities.handleErrors(invController.addClassification));
router.get("/add-inventory", utilities.handleErrors(invController.addInventoryView));
router.post("/add-inventory", regValidate.inventoryValidationRules(), regValidate.checkInventoryRegData, utilities.handleErrors(invController.addInventory));
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get('/vehicle/:id', utilities.handleErrors(invController.getVehicleDetails));
router.get('/trigger-error', utilities.handleErrors(errorController.triggerError));

module.exports = router;