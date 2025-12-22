const mongoose = require('mongoose');
const User = require('./User');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    discountPrice: {
        type: Number
    },
    countInStock: {
        type: Number,
        required: true,
        default: 0,
    },
   // Stock Keeping Unit; must be unique for every product (crucial for inventory)
    sku: {
        type: String , 
        unique: true, 
        required: true,
    },
    // Primary grouping (e.g., "Electronics", "Apparel")
    category: {
        type: String, 
        rquired: true,
    },
    // Manufacturer or Brand name (e.g., "Nike", "Apple")
    brand: {
        type: String,
    },
    // Array for variations (e.g., ["S", "M", "L", "XL"])
    sizes: {
        type: [String],
        requied: true,
    },
    colors: {
        type: [String],
        required: true,
    },
    // Special grouping (e.g., "Summer 2024", "Holiday Special")
    collections: {
        type: String,
        required: true,
    },
    // Fabric or build material (e.g., "100% Cotton", "Polished Aluminum")
    material: {
        type: String,
    },
    gender: {
        type: String,
        enum: ["Men", "Women", "Unisex"],
    },
    images: [{
        url: {
            type: String,
            required: true,
        },
        altText: {
            type: String,
        }
    }],
    isFeatured: {
        type: Boolean,
        default: false, // Used to highlight products on the homepage or "Hot Picks" section
    },
    isPublished: {
        type: Boolean,
        default: false, // Draft mode; if false, the product won't show in the public store
    },
    rating: {
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
    tags: [String], // Keywords for searchability (e.g., ["eco-friendly", "winter", "sale"])
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true,
    },
    // --- SEO Metadata Fields ---
    metaTitle: {
        type: String, // Title tag for Search Engines
    },
    metaDescription: {
        type: String, // Snippet that appears in Google search results
    },
    metaKeywords: {
        type: String, // Keywords specifically for SEO crawlers
    }, 
    // --- Logistics/Shipping Fields ---
    dimensions: {
        length: Number,
        width: Number,
        height: Number,
    },
   // Used to calculate shipping costs based on weight
    weight: Number
},
{ timestamps: true}
);

module.exports = mongoose.model("Product", productSchema);