const Game = require("../models/game");
const CustomError = require("../lib/customError");
const services = require("../services/services");
const validateFields = require("../validators/validateFields");

const createGame = async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
};

const getGame = async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
};

const updateGame = async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
};

const deleteGame = async (req, res, next) => {
  try {
    if (req.user.role !== "superadmin") {
      throw new CustomError("Unauthorized access", 410);
    }
    let gameId = req.params.game_id;
    if (!gameId) {
      throw new CustomError("Game id is require", 403);
    }

    let gameData = services.findAndUpdate(
      Game,
      { _id: gameId },
      { is_deleted: true },
      { new: true }
    );
    if (gameData) {
      res
        .status(200)
        .json({ success: true, message: "Game deleted successfully" });
    } else {
      throw new CustomError("Resources not found", 404);
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createGame,
  getGame,
  updateGame,
  deleteGame,
};
