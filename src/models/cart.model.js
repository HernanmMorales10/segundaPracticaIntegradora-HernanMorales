const mongoose = require('mongoose');
const cartCollection = "carts";

const cartSchema = new mongoose.Schema({
    title: String,
    products: {
        type: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "products",
                    autopopulate: true
                },
                product_sku: { type: String, required: true },
                quantity: { type: Number, default: 1 }
            }
        ],
        default: []
    }
})

//Populate
cartSchema.plugin(require('mongoose-autopopulate'));

const cartModel = mongoose.model(cartCollection, cartSchema);

module.exports = { cartModel };