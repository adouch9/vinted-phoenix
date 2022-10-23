const User = require("../models/User");
const chalk = require("chalk");

const isAuthenficated = async (req, res, next) => {
  try {
    console.log(chalk.blue("je passe dans mon middleware"));
    if (req.headers.authorization) {
      console.log(
        "J'affiche le token original: " + chalk.red(req.headers.authorization)
      );
      const token = req.headers.authorization.replace("Bearer ", "");
      console.log("j'efface Beared et l'esapce: " + chalk.red(token));
      const user = await User.findOne({ token: token }).select("account _id");
      console.log(user);
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }

    // next();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = isAuthenficated;
