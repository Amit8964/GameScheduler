const logger = require("../lib/errorLogger");
const errorHandler = async (err, req, res, next) => {
  // Default values for error
  let statusCode = err.statusCode || 500;
  let errorMessage = err.message || "Internal Server Error";

  if (!err.priority || err.priority == "HIGH") {
    console.log(err);

    let errorData = {
      stack_trace: err.stack,
      message: err.message,
      priority: err.priority ? err.priority : "HIGH",
      functionName: err.functionName ? err.functionName : "NOT KNOWEN",
    };
    await logger(errorData);

    //we can log our error here
  }

  // Set the response status and message
  res.status(statusCode).json({
    success: false,
    message: errorMessage,
  });
};

module.exports = errorHandler;
