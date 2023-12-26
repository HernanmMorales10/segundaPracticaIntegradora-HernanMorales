//Importaciones necesarias
const express = require('express');
const router = express.Router();
const { userModel } = require('../models/user.model');
const { cartModel } = require('../models/cart.model');
const { productModel } = require('../models/product.model');
const { createHash, isValidatePassword } = require('../utils')
const passport = require('passport');
const jwt = require('jsonwebtoken');


//Renderizar vista de registro
router.get("/register", (req, res) => {
    try {
        res.render("register.handlebars")
    } catch (error) {
        res.status(500).send("Error de presentación.")
    }
})

//Renderizar vista de login
router.get("/", (req, res) => {
    try {
        res.render("login.handlebars")
    } catch (error) {
        res.status(500).send("Error de presentación.")
    }
})

//Renderizar vista del perfil una vez logeado
router.get('/profile', passport.authenticate("jwt", { session: false }), (req, res) => {
    try {
        if (!req.user) {
            return res.redirect('/api/sessions');
        }

        let { first_name, last_name, email, age, role, carts } = req.session.user;

        res.render('profile.handlebars', {
            first_name, last_name, email, age, role, carts
        });

    } catch (error) {
        res.status(500).send("Error de presentación.")
    }
});


//--------------------------------------------------------------------//

//Destruir session
router.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (!err) {
            res.redirect('/api/sessions')
        } else {
            res.send("Error al intentar salir.")
        }
    })
})

//----------------------------------------------------------------------------//

//Registrar usuario (Estrategia local)
router.post("/register", passport.authenticate("register", { failureRedirect: "/api/sessions/failRegister" }), async (req, res) => {
    try {
        console.log("Usuario registrado correctamente.");
        res.redirect("/api/sessions")

    } catch (error) {
        res.status(500).send("Error de registro.")
    }
})

//Ruta por si no se logra hacer el passport register.
router.get('/failRegister', async (req, res) => {
    console.log("Failed strategy");
    res.send({ error: "Failed" })
})


//-----------------------------------------------------------------------------//

//Autenticación con JWT
router.post("/", async (req, res) => {
    const { email, password } = req.body;

    //Buscar usuario en la base.
    const user = await userModel.findOne({ email: email })
    if (!user) return res.send({ message: "Usuario no registrado" })

    //Comparación del pass del usuario con el pass hasheado.
    if (!isValidatePassword(user, password)) return res.send({ message: "Contraseña incorrecta." });

    //Creación del token.
    let token = jwt.sign({ email, password }, "coderSecret", { expiresIn: "24h" });

    //El cliente envía sus credenciales mediante una cookie.
    res.cookie("coderCookieToken", token, {
        maxAge: 60 * 60 * 1000,
        httpOnly: true
    })

    req.session.user = {
        first_name: user.first_name,
        last_name: user.last_name,
        age: user.age,
        email: user.email,
        role: user.role,
        carts: user.carts
    }

    res.redirect("/api/sessions/profile")

})


//Ruta para devolver el actual usuario.
router.get("/current", passport.authenticate("jwt", { session: false }), (req, res) => {
    res.send(req.user)
})


//---------------------------------------------------------------//

//Autenticación. Estrategia con GitHub.
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }), async (req, res) => { })

router.get("/githubcallback", passport.authenticate("github", { failureRedirect: "/api/sessions/" }), async (req, res) => {
    req.session.user = req.user;
    res.redirect("/api/sessions/profile")
})


//--------------------------------------------------------------//

//Renderizar vista para cambiar password.
router.get('/restore', (req, res) => {
    try {
        res.render('restore.handlebars')
    } catch (error) {
        res.status(500).send("Error de presentación.")
    }
})


//Cambiar contraseña.
router.post('/restore', async (req, res) => {
    try {
        let { email, newPassword } = req.body;
        if (!email || !newPassword) return res.status(400).send({ status: "error", error: "Valores inexistentes" })

        //Verificar existencia de usuario en db
        let user = await userModel.findOne({ email: email });

        if (!user) return res.status(400).send({ status: "error", error: "Usuario no encontrado" })

        //Actualizando password con hash
        user.password = createHash(newPassword);

        //Actualizamos usuario en la base con su nuevo password.
        await userModel.updateOne({ _id: user._id }, user);

        //Redirigir para logearse.
        res.redirect("/api/sessions");

    } catch (error) {
        res.status(500).send("Error al cambiar contraseña.")
    }
})


module.exports = router;