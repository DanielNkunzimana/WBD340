const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = utilities.handleErrors(async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
})

invCont.getVehicleDetails = utilities.handleErrors(async (req, res) => {
  const vehicleId = req.params.id; 
  const vehicle = await invModel.getVehicleById(vehicleId); 
  const nav = await utilities.getNav();
  const vehicleDetailHTML = utilities.buildVehicleDetail(vehicle, req);

  if (!vehicle) {
      return res.status(404).render('errors/error', {
          title: '404',
          notice: 'Vehicle not found.'
      });
  }

  res.render('inventory/vehicle-detail', {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`, 
      vehicle: vehicle,
      nav,
      vehicleDetailHTML,
  });
});

invCont.managementView = utilities.handleErrors(async (req, res) => {
  try {
    const nav = await utilities.getNav();
    res.render("inventory/management", { 
      nav, 
      title: "Inventory Management",
      errors: null 
    });
  } catch (error) {
    console.error("Error rendering management view:", error);
  }
});

invCont.addClassificationView = utilities.handleErrors(async (req, res) => {
  try {
    const nav = await utilities.getNav();
    const notice = req.flash("notice");
    res.render("inventory/add-classification", { 
      notice, 
      nav, 
      title: "Add New Classification",
      errors: null 
    });
  } catch (error) {
    console.error("Error rendering add classification view:", error);
  }
});

invCont.addClassification = utilities.handleErrors(async (req, res) => {
  try {
    const { classification_name } = req.body;

    await invModel.addClassification(classification_name);
    req.flash("notice", "New classification added successfully.");
    res.redirect("/inv");
  } catch (error) {
    req.flash("notice", "Failed to add classification.");
    res.redirect("/inv/add-classification");
  }
});

invCont.addInventoryView = utilities.handleErrors(async (req, res) => {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    const notice = req.flash("notice");

    const { 
      inv_make = '', 
      inv_model = '', 
      inv_year = '', 
      inv_color = '', 
      inv_description = '', 
      inv_price = '', 
      inv_miles = '', 
      inv_image = '/images/vehicles/no-image.png', 
      inv_thumbnail = '/images/vehicles/no-image-tn.png',
      classification_id = '' 
    } = req.body;

    res.render("inventory/add-inventory", { 
      classificationList, 
      notice, 
      nav, 
      title: "Add New Vehicle", 
      errors: null, 
      inv_make, 
      inv_model, 
      inv_year, 
      inv_color,
      inv_description,
      inv_price,
      inv_miles,
      inv_image, 
      inv_thumbnail,
      classification_id 
    });
  } catch (error) {
    console.error("Error rendering Add Inventory View:", error);

    req.flash("notice", "There was an error loading the page. Please try again.");
    res.redirect("/inv");
  }
});


invCont.addInventory = utilities.handleErrors(async (req, res) => {
  try {
    const inventoryData = req.body;
    await invModel.addInventory(inventoryData);
    req.flash("notice", "New vehicle added successfully.");
    res.redirect("/inv");
  } catch (error) {
    req.flash("notice", "Failed to add vehicle. Please try again.");
    res.redirect("/inv/add-inventory");
  }
});


module.exports = invCont