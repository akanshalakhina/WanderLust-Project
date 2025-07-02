const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title : {
        type: String,
        required: true,
    },    
    description: String,
    image: {
        filename: String,
        url: String,
    },
    price: Number,
    location: String,
    country: String,
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : "Review",
        }
    ],
});
listingSchema.post("findOneAndDelete", async(listing) => {
    await Review.deleteMany({reviews : {$in: listing.reviews} });
    // This will delete all reviews associated with the listing being deleted
});
const Listing  = mongoose.model("Listing", listingSchema);
module.exports = Listing;