const express = require("express");
const router = express.Router();
const chalk = require("chalk");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const isAuthenficated = require("../middlewares/isAuthenticated");
//------------------------------------------------------------------------------CONVERT TO BASE 64----------------------------------------------------------------------------------------------------------
const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

//---------------------------------------------------------------------------ROUTE/POST/OFFER/PUBLISH-------------------------------------------------------------------------------------------------------------
const Offer = require("../models/Offer");
router.post(
  "/offer/publish",
  isAuthenficated,
  fileUpload(),
  async (req, res) => {
    try {
      // console.log(chalk.blue("je sort de mon middlewares"));
      const { title, description, price, condition, city, brand, size, color } =
        req.body;

      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          {
            MARQUE: brand,
          },
          {
            TAILLE: size,
          },
          {
            ÉTAT: condition,
          },
          {
            COULEUR: color,
          },
          {
            EMPLACEMENT: city,
          },
        ],
        owner: req.user,
      });

      const image = await cloudinary.uploader.upload(
        convertToBase64(req.files.picture)
      );
      newOffer.product_image = image;
      await newOffer.save();
      res.json(newOffer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);
//------------------------------------------------------------------ROUTE/GET/OFFERS--------------------------------------------------------------------------------------------------------
router.get("/offers", async (req, res) => {
  // J'utilise le package chalk pour afficher des couleur dans ma console
  try {
    const filters = {};

    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }

    if (req.query.priceMin) {
      filters.product_price = {
        $gte: Number(req.query.priceMin),
      };
    }
    if (req.query.priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = Number(req.query.priceMax);
      } else {
        filters.product_price = {
          $lte: Number(req.query.priceMax),
        };
      }
    }

    const sort = {};

    if (req.query.sort === "price-desc") {
      sort.product_price = -1; // desc                                  //CONDITION POUR PRIX CROISSANT EST DECROISSANT AVEC LA METHODE .SORT SUR MON ELEMENT SORT
    } else if (req.query.sort === "price-asc") {
      sort.product_price = 1; // asc
    }
   
    if (req.query.limit) {
      limit = req.query.limit;
    }

    let page = 1;                                                      
    if (req.query.page) {
      page = req.query.page;
    }

    const skip = (page - 1) * limit;
    
    const results = await Offer.find(filters) //j'ajoute tout les element sur mon tableau vide
      .sort(sort) // j'utilise la methode .sort pour remplir mon tableau vide
      .skip(skip)
      .limit(limit);
    // .select("product_name product_price -_id"); // j'utilise la methode .select pour selectionner le name, price, id
    const count = await Offer.countDocuments(filters);
    res.json({ count: count, offers: results });
    
  } catch (error) {
    res.status(400).json({ message: error.message }); // CATCH ERROR 400
  }
});

//-------------------------------------------------------------ROUTE/GET/OFFER/:ID---------------------------------------------------------------------------------------------------------------

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate(
      "owner",
      "account"
    );
    res.json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message }); // CATCH ERROR 400
  }
});

module.exports = router;
