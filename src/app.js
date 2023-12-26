const express = require('express');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const handlebars = require('express-handlebars');
const app = express();
const PORT = 8080;
const path = require('path')
const passport = require('passport');
const cookieParser = require('cookie-parser');
const initializePassport = require('./config/passport.config');
const productRouter = require('./routes/products.router');
const cartRouter = require('./routes/carts.router');
const sessionRouter = require('./routes/sessions.router');

//Servidor escuchando
app.listen(PORT, () => {
    console.log(`Servidor is running on port ${PORT}`);
})

//Conexión con Mongo Atlas
const enviroment = async () => {
    await mongoose.connect("mongodb+srv://francogaray4:fg_dbUser_84@cluster0.9vspn3d.mongodb.net/ecommerceProyectoFinal?retryWrites=true&w=majority")
        .then(() => {
            console.log("Conectado a la base de datos de MongoDB Atlas.");
        })
        .catch((error) => {
            console.log("Error al conectar", error);
        })
}
enviroment();


//Persistir información de sesiones en una db.
app.use(session({
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://francogaray4:fg_dbUser_84@cluster0.9vspn3d.mongodb.net/ecommerceProyectoFinal?retryWrites=true&w=majority",
        mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
        ttl: 1000
    }),
    secret: "coderSecret",
    resave: false,
    saveUninitialize: false
}))


//Middleware passport
initializePassport();
app.use(passport.initialize())
app.use(passport.session());


//Middleware cookie-parser
app.use(cookieParser());


//Config Handlebars
app.engine("handlebars", handlebars.engine())
app.set("views", path.join(__dirname, 'views'))
app.set("view engine", "handlebars")


//Middleware para analizar el cuerpo de las solicitudes.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//Routing
app.use("/api", productRouter);
app.use("/api", cartRouter);
app.use("/api/sessions", sessionRouter)