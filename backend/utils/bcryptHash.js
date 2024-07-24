const bcrypt = require("bcrypt");
const CustomError = require("../lib/customError");

const generateHashPassword = async (password) => {
  try {
    let hashPass = await bcrypt.hash(password, 10);
    return hashPass;
  } catch (err) {
    throw err;
  }
};

const compareHashPassword = async (bodyPass, hashPass) => {
  try {
    if (bodyPass && hashPass) {
      let result = await bcrypt.compare(bodyPass, hashPass);
      if (result) {
        return result;
      } else {
        return result;
      }
    } else {
      throw new CustomError("Somthing went wrong", 501);
    }
  } catch (err) {
    throw err;
  }
};

module.exports = { generateHashPassword, compareHashPassword };
