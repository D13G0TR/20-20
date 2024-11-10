import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Importar rutas
import loginRouter from "./public/login.js";
import registerRouter from "./public/register.js";
import oneScreenRouter from "./public/OneScreen.js"; // Añadimos esta importación

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
    secret: "tu_secreto_aqui",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Cambiado a false para desarrollo local
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
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
    res.redirect('/dashboard'); // Redirige a /dashboard si está autenticado
});

// Usar rutas
app.use("/login", loginRouter);
app.use("/register", registerRouter);
app.use("/dashboard", isAuthenticated, oneScreenRouter); // Protegemos la ruta del dashboard

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