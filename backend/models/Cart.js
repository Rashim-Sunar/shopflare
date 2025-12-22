const mongoose = require('mongoose');

/* ======================================================
   CART ITEM SCHEMA
   Represents a single product added to the cart.
   Stored as a subdocument inside the Cart schema.
====================================================== */

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Snapshot of product name (to avoid extra DB lookups)
    name: {
      type: String,
    },

    // Product image URL (usually first image)
    image: {
      type: String,
    },

    // Product price at the time it was added to cart
    // Stored as snapshot to prevent price changes affecting cart
    price: {
      type: String,
    },

    size: {
      type: String,
    },

    color: {
      type: String,
    },

    // Quantity of this product in cart
    quantity: {
      type: Number,
      default: 1,
    },
  },
  {
    // Prevents MongoDB from generating _id for each cart item
    _id: false,
  }
);

/* ======================================================
   CART SCHEMA
   Represents a shopping cart for either:
   - a logged-in user
   - a guest user (using guestId)
====================================================== */

const cartSchema = new mongoose.Schema(
  {
    // Reference to logged-in user (optional)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Unique identifier for guest users
    // Used when user is not authenticated
    guestId: {
      type: String,
    },

    // List of products added to the cart
    products: [cartItemSchema],

    // Recalculated whenever items are added/updated/removed
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cart", cartSchema);
