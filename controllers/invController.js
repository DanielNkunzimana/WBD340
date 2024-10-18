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
    const classificationList = await utilities.buildClassificationList();
    res.render("inventory/management", { 
      nav, 
      title: "Inventory Management",
      errors: null,
      classificationList
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

invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

invCont.getEditInventoryView = utilities.handleErrors(async (req, res) => {
  const inventoryId = req.params.inventory_id;
  const inventoryItem = await invModel.getInventoryById(inventoryId);
  const classificationList = await invModel.getSingleClassifications();
  const nav = await utilities.getNav();

  if (!inventoryItem) {
    req.flash("notice", "Inventory item not found.");
    return res.redirect("/inv");
  }
  const errors = req.flash("errors") || [];

  res.render('inventory/edit-inventory', {
    title: `Edit ${inventoryItem.inv_make} ${inventoryItem.inv_model}`,
    nav,
    inventoryItem,
    classificationList,
    errors,
  });
});

invCont.updateInventory = utilities.handleErrors(async (req, res) => {
  const invId = req.params.id;
  const inventoryData = {
    inv_id: invId,
    inv_make: req.body.inv_make,
    inv_model: req.body.inv_model,
    inv_year: req.body.inv_year,
    inv_description: req.body.inv_description,
    inv_image: req.body.inv_image,
    inv_thumbnail: req.body.inv_thumbnail,
    inv_price: req.body.inv_price,
    inv_miles: req.body.inv_miles,
    inv_color: req.body.inv_color,
    classification_id: req.body.classification_id,
  };

  try {
    await invModel.updateInventory(inventoryData);
    req.flash("notice", `${inventoryData.inv_make} ${inventoryData.inv_model} updated successfully.`);
    res.redirect('/inv');
  } catch (error) {
    console.error("Error updating vehicle:", error);
    req.flash("notice", "Failed to update vehicle. Please try again.");
    res.redirect(`/inv/edit/${invId}`);
  }
});

invCont.getDeleteView = async (req, res) => {
  const inventoryId = req.params.inv_id;
  const inventoryItem = await invModel.getInventoryById(inventoryId);
  const nav = await utilities.getNav();
  
  if (!inventoryItem) {
    req.flash("notice", "Inventory item not found.");
    return res.redirect("/inv");
  }

  res.render('inventory/delete-confirm', {
    title: `Delete ${inventoryItem.inv_make} ${inventoryItem.inv_model}`,
    nav,
    inventoryItem,
    errors: null
  });
};

invCont.deleteInventoryItem = async (req, res) => {
  const inv_id = parseInt(req.body.inv_id);
  const deleteResult = await invModel.deleteInventoryItem(inv_id);
  
  if (deleteResult.rowCount) {
    req.flash("notice", "Inventory item successfully deleted.");
    res.redirect("/inv");
  } else {
    req.flash("notice", "Error: Unable to delete inventory item.");
    res.redirect(`/inv/delete/${inv_id}`);
  }
};

module.exports = invCont