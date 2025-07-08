const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapboxToken }); 

module.exports.index = async(req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
};

module.exports.renderNewForm = (req,res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing =  async(req, res) => {
    let{ id } = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate : { path: "author"},}).populate("owner");
   if(!listing) {
    req.flash("error", "Listing Not Found!");
    return res.redirect("/listings");
   }
   console.log(listing);
   res.render("listings/show.ejs", { listing });
};
module.exports.createListing = async(req, res, next) => {
  let response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1,
  })
  .send()

  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry = response.body.features[0].geometry; // Set geometry from geocoding response
  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
}

module.exports.renderEditForm = async(req,res) => {
  let  {id} = req.params;
  const listing = await Listing.findById(id);
   if(!listing) {
    req.flash("error", "Listing Not Found!");
    return res.redirect("/listings");
   };
   let originalImageUrl = listing.image.url;
   originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
   res.render("listings/edit.ejs", { listing, originalImageUrl});
};

/*module.exports.updateListing = async(req,res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing });
  if(typeof req.file !== "undefined") {
  let url = req.file.path;
  let filename = req.file.filename;
  listing.image = { url, filename };
  await listing.save();
}
  req.flash("success", " Listing Updated!");
  res.redirect(`/listings/${id}`);
};*/
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  // Only update geometry if location is updated and valid
  if (req.body.listing.location) {
    const geoRes = await geocodingClient.forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    }).send();

    const geoData = geoRes.body.features[0];
    if (geoData) {
      listing.geometry = geoData.geometry;
    } else {
      req.flash("error", "Updated location not found. Please enter a valid place.");
      return res.redirect(`/listings/${id}/edit`);
    }
  }

  // Image update
  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  await listing.save();
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};


module.exports.destroyListing = async(req,res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
