const express = require("express"); //Import express
const mongoose = require("mongoose"); //Import mongoose
const chalk = require("chalk"); //Import chalk pour mettre des couleurs sur le terminal
const cloudinary = require("cloudinary").v2; //Import cloudinary
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI); // Connection a mongoose);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY, //connection a cloudinary
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer"); // variable pour définir les routes de mon dossier routes
app.use(userRoutes);
app.use(offerRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ message: "This route does not exist" }); // Si route n'existe pas
});

app.listen(process.env.PORT, () => {
  console.log(
    "                                               " + // connection au port 3000 + afficha de couleur de fond sur le terminal
      chalk.bold.red.bgYellow(
        "                      Server started                    "
      )
  );
});
