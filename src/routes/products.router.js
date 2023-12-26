const { Router } = require('express');
const { productModel } = require('../models/product.model');
const router = Router();

//Obtener lista de productos
router.get("/products", async (req, res) => {
    try {
        let products = await productModel.find();
        const pageSize = parseInt(req.query.limit) || 10;  //Query limit opcional
        const page = parseInt(req.query.page) || 1;        //Query page opcional
        const orden = req.query.sort;                      //Query sort opcional
        let filtro = {}
        if (req.query.categoria) filtro = { categoria: req.query.categoria }
        if (req.query.stock) filtro = { stock: req.query.stock }

        const options = {
            page,
            limit: pageSize,
            sort: ({ "precio": orden }) || products
        };

        let result = await productModel.paginate(filtro, options);
        res.send({ result: "Success", payload: result });
        console.log(result);

    } catch (error) {
        res.send({ status: error, error: "Error al obtener información de los productos." })
    }
})


//Obtener producto por ID
router.get("/products/:pid", async (req, res) => {
    try {
        let { pid } = req.params;

        let result = await productModel.findById({ _id: pid });
        res.send({ result: "Success", payload: result });

    } catch (error) {
        res.send({ status: error, error: "Error al obtener un producto por su ID." });
    }
})


//Agregar productos
router.post("/products", async (req, res) => {
    try {
        let { nombre, categoria, precio, stock, imagen } = req.body;

        if (!nombre || !categoria || !precio || !stock || !imagen) {
            res.send({ status: "error", error: "Faltan parámetros para crear el producto." })
        }

        let result = await productModel.create({ nombre, categoria, precio, stock, imagen });
        res.send({ result: "Success", payload: result });

    } catch (error) {
        res.send({ status: error, error: "Error al crear producto." });
    }
})


//Actualizar un producto
router.put("/products/:pid", async (req, res) => {
    try {
        let { pid } = req.params;
        let productToReplace = req.body;

        let result = await productModel.updateOne({ _id: pid }, productToReplace);
        res.send({ result: "Success", payload: result });

    } catch (error) {
        res.send({ status: error, error: "Error al actualizar un producto." });
    }
})


//Eliminar producto por su ID.
router.delete("/products/:pid", async (req, res) => {
    try {
        let { pid } = req.params;
        let result = await productModel.deleteOne({ _id: pid });
        res.send({ result: "Success", payload: result });

    } catch (error) {
        res.send({ status: error, error: "Error al eliminar un producto." })
    }
})


module.exports = router;