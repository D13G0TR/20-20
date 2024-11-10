import express from "express";
import bcrypt from "bcrypt";
import connection from "../db.js";

const router = express.Router();

// Ruta GET para mostrar el formulario de login
router.get("/", (req, res) => {
    if (req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.render("login", { error: null });
});

// Ruta POST para procesar el login
router.post("/", async (req, res) => {
    try {
        const { email, contraseña } = req.body;
        
        // Buscar usuario por email
        connection.query(
            "SELECT * FROM Usuarios WHERE Email = ?",
            [email],
            async (error, results) => {
                if (error) {
                    console.error("Error en la consulta:", error);
                    return res.render("login", { error: "Error en el servidor" });
                }

                if (results.length === 0) {
                    return res.render("login", { error: "Credenciales incorrectas" });
                }

                const user = results[0];

                // Verificar contraseña
                const validPassword = await bcrypt.compare(contraseña, user.Contraseña);
                if (!validPassword) {
                    return res.render("login", { error: "Credenciales incorrectas" });
                }

                // Establecer sesión
                req.session.userId = user.id;
                req.session.userRole = user.Rol;

                // Redirigir al dashboard
                res.redirect("/dashboard");
            }
        );
    } catch (error) {
        console.error("Error en login:", error);
        res.render("login", { error: "Error en el servidor" });
    }
});

export default router;