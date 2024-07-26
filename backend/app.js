const express = require("express");
const app = express();
const errorHandler = require("./middlewares/errorMiddleware");
const CustomError = require("./lib/customError");
const mongoose = require("mongoose");
const config = require("./config/config");
const userRoutes = require("./routes/userRoutes");

mongoose
  .connect(config.DB_CONFIG.DB_URL)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(express.json());
app.use("/api/v1", userRoutes);

// Middleware for handling invalid routes
app.use((req, res, next) => {
  next(new CustomError("Route Not Found", 404));
});

// Use the global error handler middleware
app.use(errorHandler);

app.listen(3000, () => {
  console.log("App is listening on port number 3000");
});
