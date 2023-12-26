const { Router } = require('express');
const { cartModel } = require('../models/cart.model');
const { productModel } = require('../models/product.model');
const { userModel } = require('../models/user.model');
const router = Router();

//Crear carrito
router.post("/cart", async (req, res) => {
    let { title } = req.body;
    const result = await cartModel.create({ title });
    res.send({ result: "Success", payload: result });
})



//Agregando un producto al carrito con la cantidad deseada a un usuario determinado.
router.put("/cart/:cid/products/:pid/user/:uid", async (req, res) => {
    try {
        let { cid } = req.params;
        let { pid } = req.params;
        let { uid } = req.params;
        let { quantity } = req.body;

        //Buscamos carrito por su ID
        let cart = await cartModel.findById({ _id: cid })
        if (!cart) {
            res.status(404).json({ error: `El carrito con el id proporcionado no existe` })
        }

        //Buscamos producto por su ID.
        let product = await productModel.findById({ _id: pid });
        if (!product) {
            res.status(404).json({ error: `El producto con el id proporcionado no existe` })
        }

        //Buscamos usuario por su ID
        let user = await userModel.findById({ _id: uid })
        if (!user) {
            res.status(404).json({ error: `El usuario con el id proporcionado no existe` })
        }

        //Validamos la existencia del producto en el carrito
        const foundProductInCart = cart.products.find((p) => {
            return p.product_sku === pid
        })

        //Si existe le actualizamos la cantidad enviada por body.
        //Si no existe pusheamos el nuevo producto con la cantidad enviada por body.
        const indexProduct = cart.products.findIndex((p) => p.product_sku === pid)
        if (foundProductInCart) {
            cart.products[indexProduct].quantity += quantity || 1;
        } else {
            cart.products.push({ product: pid, quantity: quantity, product_sku: pid });
        }

        //Actualizamos las modificaciones del carrito.
        await cartModel.updateOne({ _id: cid }, cart);

        //Buscamos carrito nueevamente para el populate.
        cart = await cartModel.findById({ _id: cid })


        //----------------------------------------------------------//

        //Validamos la existencia del carrito en el usuario
        const foundCartInUser = user.carts.find((c) => {
            return c.cart_sku === cid
        })

        //Si no existe pusheamos el nuevo carrito con los productos
        //De lo contrario solo se actualiza el carrito existente del usuario.
        if (!foundCartInUser) {
            user.carts.push({ cart: cid, cart_sku: cid })
        }

        //Actualizamos las modificaciones del usuario.
        await userModel.updateOne({ _id: uid }, user);
        //Buscamos usuario nuevamente para el populate.
        user = await userModel.findById({ _id: uid })
        //Presentación del usuario con su carrito
        console.log(JSON.stringify(user, null, '\t'));
        res.send({ result: "Success", payload: user });



    } catch (error) {
        res.send({ status: error, error: "Error al agregar producto al carrito." });
    }
})




//Eliminar productos del carrito
router.delete("/cart/:cid", async (req, res) => {
    try {
        let { cid } = req.params;

        //Buscamos carrito por su ID
        let cart = await cartModel.findById({ _id: cid });
        if (!cart) {
            res.status(404).json({ error: `El carrito con el id proporcionado no existe` })
        }

        //Vaciamos el array products del carrito.
        cart.products = [];

        //Actualizamos las modificaciones del carrito.
        let result = await cartModel.updateOne({ _id: cid }, cart);
        console.log(JSON.stringify(cart, null, '\t'));
        res.send({ result: "Success", payload: result });


    } catch (error) {
        res.status(404).json({ error: `Error al eliminar un producto.` })
    }

})


module.exports = router;