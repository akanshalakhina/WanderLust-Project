const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isowner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({storage});

router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn, upload.single('image'), validateListing, wrapAsync(listingController.createListing));

//New route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put( isLoggedIn, isowner, upload.single('image'), validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isowner, wrapAsync(listingController.destroyListing));

//edit route
router.get("/:id/edit",isLoggedIn,isowner, wrapAsync(listingController.renderEditForm));



module.exports = router;