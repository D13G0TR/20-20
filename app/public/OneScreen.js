import express from "express";
import connection from "../db.js";

const router = express.Router();

// Ruta principal que requiere autenticación
router.get("/", async (req, res) => {
    try {
        // Obtener información del usuario actual
        const user = await getUserById(req.session.userId);
        
        // Obtener productos del inventario
        const productos = await getProductos();

        // Renderizar OneScreen.ejs con los datos necesarios
        res.render("OneScreen", {
            user: user,
            productos: productos
        });

    } catch (error) {
        console.error("Error en OneScreen:", error);
        res.status(500).render("error", { message: "Error al cargar el dashboard" });
    }
});

// Funciones auxiliares
const getUserById = (userId) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM Usuarios WHERE id = ?', 
        [userId], 
        (error, results) => {
            if (error) return reject(error);
            if (results.length === 0) return reject(new Error('Usuario no encontrado'));
            resolve(results[0]);
        });
    });
};

const getProductos = () => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM Productos', (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

// Ruta para cerrar sesión
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error al cerrar sesión:", err);
            return res.status(500).send("Error al cerrar sesión");
        }
        res.redirect('/login');
    });
});

export default router;