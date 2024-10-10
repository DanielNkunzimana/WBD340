const pool = require("../database/")
const bcrypt = require("bcryptjs")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
        const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
        return error.message
    }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
    try {
      const sql = "SELECT * FROM account WHERE account_email = $1"
      const email = await pool.query(sql, [account_email])
      return email.rowCount
    } catch (error) {
      return error.message
    }
}


/* **********************
 *   Login account
 * ********************* */
async function checkLoginCredentials(account_email, account_password) {
    try {
        const sql = "SELECT * FROM account WHERE account_email = $1";
        const result = await pool.query(sql, [account_email]);

        if (result.rowCount === 0) {
            return { success: false, message: "Email not found" };
        }

        const account = result.rows[0];

        const match = await bcrypt.compare(account_password, account.account_password);

        if (match) {
            return { success: true, account };
        } else {
            return { success: false, message: "Incorrect password" };
        }
    } catch (error) {
        return { success: false, message: error.message };
    }
}


module.exports = { registerAccount, checkExistingEmail, checkLoginCredentials }