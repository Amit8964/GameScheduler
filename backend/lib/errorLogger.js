const ErrorLog = require("../models/error");
const services = require("../services/services");
const logger = async (data) => {
  try {
    let result = await services.saveData(ErrorLog, data);
    if (result) {
      console.log("error logged successfully");
      return result;
    } else {
      console.log("Somthing went wrong while logging the error");
    }
  } catch (err) {
    console.log(err);
  }
};
module.exports = logger;
