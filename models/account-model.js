const pool = require("../database/");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
    try {
        const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);
    } catch (error) {
        return error.message;
    }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
    try {
        const sql = "SELECT * FROM account WHERE account_email = $1";
        const email = await pool.query(sql, [account_email]);
        return email.rowCount;
    } catch (error) {
        return error.message;
    }
}

/* **********************
 *   Get account by email
 * ********************* */
async function getAccountByEmail(account_email) {
    try {
        const result = await pool.query(
            'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
            [account_email]
        );
        return result.rows[0];
    } catch (error) {
        return new Error("No matching email found");
    }
}

/* **********************
 *   Get account by ID
 * ********************* */
async function getAccountById(account_id) {
    try {
        const result = await pool.query(
            'SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account WHERE account_id = $1',
            [account_id]
        );
        return result.rows[0];
    } catch (error) {
        return new Error("No matching account found");
    }
}

/* **********************
 *   Update account details
 * ********************* */
async function updateAccount({ account_id, account_firstname, account_lastname, account_email }) {
    try {
        const sql = `UPDATE account 
                     SET account_firstname = $1, account_lastname = $2, account_email = $3 
                     WHERE account_id = $4 
                     RETURNING account_id, account_firstname, account_lastname, account_email, account_type`;
                     
        const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id]);
        
        if (result.rows.length > 0) {
            return result.rows[0];
        } else {
            throw new Error("Account not found.");
        }
    } catch (error) {
        console.error("Error updating account details:", error);
        throw new Error("Unable to update account details");
    }
}


/* **********************
 *   Update account password
 * ********************* */
async function updatePassword(account_id, new_password) {
    try {
        const hashedPassword = await bcrypt.hash(new_password, 10);
        const sql = `UPDATE account 
                     SET account_password = $1 
                     WHERE account_id = $2 
                     RETURNING account_id, account_firstname, account_lastname, account_email, account_type`;
        const result = await pool.query(sql, [hashedPassword, account_id]);
        return result.rows[0];
    } catch (error) {
        return new Error("Unable to update password");
    }
}

module.exports = { 
    registerAccount, 
    checkExistingEmail, 
    getAccountByEmail, 
    getAccountById, 
    updateAccount, 
    updatePassword 
};