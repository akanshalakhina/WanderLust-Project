const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require("./review.js");
const geocoding = require('@mapbox/mapbox-sdk/services/geocoding.js');

const listingSchema = new Schema({
    title : {
        type: String,
        required: true,
    },    
    description: String,
    image: {
        url: String,
        filename: String,
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
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required : true
        }   
    }
});
listingSchema.post("findOneAndDelete", async(listing) => {
    await Review.deleteMany({_id : {$in: listing.reviews} });
    // This will delete all reviews associated with the listing being deleted
});
const Listing  = mongoose.model("Listing", listingSchema);
module.exports = Listing;