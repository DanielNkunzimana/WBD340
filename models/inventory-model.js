const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

async function getVehicleById(id) {
  const query = `
      SELECT 
          inv_id, 
          inv_make, 
          inv_model, 
          inv_year, 
          inv_description, 
          inv_image, 
          inv_thumbnail, 
          inv_price, 
          inv_miles, 
          inv_color, 
          c.classification_name
      FROM 
          public.inventory i
      JOIN 
          public.classification c ON i.classification_id = c.classification_id
      WHERE 
          inv_id = $1`;

  try {
    const result = await pool.query(query, [id]);
    return result.rows[0]; 
  } catch (error) {
    console.error(`Error fetching vehicle by ID ${id}:`, error);
    throw error; 
  }
}

addClassification = async (classification_name) => {
  const query = "INSERT INTO classification (classification_name) VALUES ($1)";
  return pool.query(query, [classification_name]);
};

addInventory = async (vehicleData) => {
  const query = `
      INSERT INTO inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `;
  const values = [
      vehicleData.inv_make, vehicleData.inv_model, vehicleData.inv_year,
      vehicleData.inv_description, vehicleData.inv_image, vehicleData.inv_thumbnail,
      vehicleData.inv_price, vehicleData.inv_miles, vehicleData.inv_color,
      vehicleData.classification_id
  ];
  return pool.query(query, values);
};


module.exports = {getClassifications, getInventoryByClassificationId, getVehicleById, addClassification, addInventory}