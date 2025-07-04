const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { isLoggedIn } = require("../views/middleware.js");


const validateListing = (req, res, next) => {
  let {error} = listingSchema.validate(req.body);
  if(error) {
    let errMessage = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errMessage);
  }else {
      next();
  }
};
const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMessage = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errMessage);
  } else {
    next();
  }
};

//Index route
router.get("/",wrapAsync(async(req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));

//New route
router.get("/new", isLoggedIn, (req,res) => {
  console.log(req.user);
  res.render("listings/new.ejs");
});
//CREATE route
router.post("/",validateListing, wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();  
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  })
);

//edit route
router.get("/:id/edit",isLoggedIn, wrapAsync(async(req,res) => {
  let  {id} = req.params;
  const listing = await Listing.findById(id);
   if(!listing) {
    req.flash("error", "Listing Not Found!");
    res.redirect("/listings");
   };
  res.render("listings/edit.ejs", { listing });

}));
//update route
router.put("/:id", isLoggedIn, validateListing, wrapAsync(async(req,res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, {...req.body.listing });
  req.flash("success", " Listing Updated!");
  res.redirect(`/listings/${id}`);
}));

//delete route
router.delete("/:id", isLoggedIn, wrapAsync(async(req,res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
}));

//Reviews
//Post Route
router.post("/:id/reviews",validateReview, wrapAsync(async(req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();

  res.redirect(`/listings/${listing._id}`);
}));
//Delete review route
router.delete("/:id/reviews/:reviewId", wrapAsync(async (req,res) => {
  let {id, reviewId} = req.params;
  await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId} });
  await Review.findById(reviewId);
  res.redirect(`/listings/${id}`);

}));

//Show route
router.get("/:id", wrapAsync(async(req, res) => {
    let  {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner");
   if(!listing) {
    req.flash("error", "Listing Not Found!");
    res.redirect("/listings");
   }
   console.log(listing);
    res.render("listings/show.ejs", { listing });
}));

module.exports = router;