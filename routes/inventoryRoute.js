// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const errorController = require("../controllers/errorController");
const utilities = require("../utilities/");
const regValidate = require('../utilities/account-validation');
const userCheck = require('../middleware/userCheck');

// Route to build inventory by classification view
router.get("/", userCheck.checkAdminOrEmployee, utilities.handleErrors(invController.managementView));
router.get("/add-classification", userCheck.checkAdminOrEmployee, utilities.handleErrors(invController.addClassificationView));
router.post("/add-classification", userCheck.checkAdminOrEmployee, regValidate.addClassification(), regValidate.checkClassificationRegData, utilities.handleErrors(invController.addClassification));
router.get("/add-inventory", userCheck.checkAdminOrEmployee, utilities.handleErrors(invController.addInventoryView));
router.post("/add-inventory", userCheck.checkAdminOrEmployee, regValidate.inventoryValidationRules(), regValidate.checkInventoryRegData, utilities.handleErrors(invController.addInventory));
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get('/vehicle/:id', utilities.handleErrors(invController.getVehicleDetails));
router.get('/trigger-error',userCheck.checkAdminOrEmployee, utilities.handleErrors(errorController.triggerError));
router.get("/getInventory/:classification_id", userCheck.checkAdminOrEmployee, utilities.handleErrors(invController.getInventoryJSON));
router.get('/edit/:inventory_id', userCheck.checkAdminOrEmployee, utilities.handleErrors(invController.getEditInventoryView));
router.post("/update/:id", userCheck.checkAdminOrEmployee, regValidate.inventoryValidationRules(), regValidate.checkEditInventoryRegData, utilities.handleErrors(invController.updateInventory));
router.get('/delete/:inv_id', userCheck.checkAdminOrEmployee, utilities.handleErrors(invController.getDeleteView));
router.post('/delete/:inv_id', userCheck.checkAdminOrEmployee, utilities.handleErrors(invController.deleteInventoryItem));
module.exports = router;