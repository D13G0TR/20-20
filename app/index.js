import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

// Importar rutas
import loginRouter from "./public/login.js";
import registerRouter from "./public/register.js";
import oneScreenRouter from "./public/OneScreen.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Configuraciones
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración de sesiones
app.use(session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 día
    }
}));

// Middleware para verificar sesión
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Rutas estáticas
app.use('/img', express.static(path.join(__dirname, 'public/img')));
app.use('/Imagenes', express.static(path.join(__dirname, 'public/Imagenes')));

// Rutas principales
app.get('/', isAuthenticated, (req, res) => {
    res.redirect('/dashboard');
});

// Usar rutas
app.use("/login", loginRouter);
app.use("/register", registerRouter);
app.use("/dashboard", isAuthenticated, oneScreenRouter);

// Manejador de errores 404
app.use((req, res) => {
    res.status(404).render('error', { message: 'Página no encontrada' });
});

// Manejador de errores generales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { message: 'Error del servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});

export default app;
