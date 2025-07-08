require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const geocoder = require('./utils/geocoder');

// ✅ Connect to your MongoDB database
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("MongoDB Connected!");
})
.catch((err) => {
  console.error("MongoDB Connection Error:", err);
});

async function fixListings() {
  const listings = await Listing.find({ geometry: { $exists: false } });

  for (let listing of listings) {
    const geoData = await geocoder.forwardGeocode({
      query: listing.location,
      limit: 1
    }).send();

    listing.geometry = geoData.body.features[0].geometry;
    await listing.save();
    console.log(`✅ Fixed: ${listing.title}`);
  }

  mongoose.connection.close(); // ✅ Close the connection after done
}

fixListings();
