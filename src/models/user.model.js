const mongoose = require('mongoose');
const userCollection = "users";

const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    age: String,
    password: String,
    role: { type: String, default: "user" },

    carts: {
        type: [
            {
                cart: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "carts",
                    autopopulate: true,
                },
                cart_sku: { type: String, required: true }
            }
        ],
        default: []
    }

})


//Populate
userSchema.plugin(require('mongoose-autopopulate'));

const userModel = mongoose.model(userCollection, userSchema)

module.exports = { userModel };