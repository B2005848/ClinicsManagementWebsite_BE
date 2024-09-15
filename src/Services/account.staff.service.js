const bcrypt = require("bcryptjs");

const { knex } = require("../../db.config");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const accountStaffService = {
  // --------------------------------CREATE ACCOUNT STAFF-------------------------------
  async createAccount(accountData, staff_detailsData) {
    let transaction;
    try {
      transaction = await knex.transaction();
      // status = 1: account active, 2: temporarily locked, 3: Stop working
      accountData.status = "1";
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const passwd_hash = await bcrypt.hash(accountData.password, salt);
      accountData.password = passwd_hash;
      accountData.salt = salt;

      // check account exits?
      const checkAccount = await knex("STAFF_ACCOUNTS")
        .where("staff_id", accountData.staff_id)
        .first();
      if (!checkAccount) {
        // Add a new account
        await transaction("STAFF_ACCOUNTS").insert(accountData);
        // Get staff_id was just created assign it to staff_id of staff_detailsData
        staff_detailsData.staff_id = accountData.staff_id;
        // Insert information of staff into STAFF_DETAILS table
        await transaction("STAFF_DETAILS").insert(staff_detailsData);
        await transaction.commit();
        console.log("Create a staff account success", [staff_detailsData]);
        return {
          status: true,
          message: "Create a staff account success",
          data: [staff_detailsData],
        };
      } else {
        await transaction.rollback();
        console.log("Account staff already exists", [accountData]);
        return {
          status: false,
          message: "Account staff already exists",
        };
      }
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.log("Error creating staff account: ", error);
      return {
        status: false,
        message: "Error create account staff",
        error: error.message,
      };
    }
  },
};

module.exports = accountStaffService;