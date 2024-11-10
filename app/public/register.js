// register.js

import express from "express";
import bcrypt from "bcrypt";
import connection from "../db.js";

const router = express.Router();

// Mostrar formulario de registro
router.get("/", (req, res) => {
    res.render("register");
});

// Procesar registro
router.post("/", async (req, res) => {
    try {
        const { nombre, apellido, rut, email, contraseña, rol } = req.body;

        // Validaciones
        if (!contraseña) {
            return res.status(400).json({ error: "La contraseña es requerida" });
        }

        // Verificar duplicados
        const emailExists = await checkEmailExists(email);
        if (emailExists) {
            return res.status(400).json({ error: "Email ya registrado" });
        }

        const rutExists = await checkRutExists(rut);
        if (rutExists) {
            return res.status(400).json({ error: "RUT ya registrado" });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(contraseña.toString(), 10);

        // Insertar usuario
        const query = "INSERT INTO Usuarios (Nombre, Apellido, Rut, Email, Contraseña, Rol) VALUES (?, ?, ?, ?, ?, ?)";
        connection.query(query, [nombre, apellido, rut, email, hashedPassword, rol], (err) => {
            if (err) {
                console.error("Error al registrar:", err);
                return res.status(500).json({ error: "Error al registrar" });
            }
            res.redirect("/");
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Error del servidor" });
    }
});

// Funciones auxiliares
async function checkEmailExists(email) {
    return new Promise((resolve, reject) => {
        connection.query("SELECT COUNT(*) AS count FROM Usuarios WHERE Email = ?", [email], (err, result) => {
            if (err) return reject(err);
            resolve(result[0].count > 0);
        });
    });
}

async function checkRutExists(rut) {
    return new Promise((resolve, reject) => {
        connection.query("SELECT COUNT(*) AS count FROM Usuarios WHERE Rut = ?", [rut], (err, result) => {
            if (err) return reject(err);
            resolve(result[0].count > 0);
        });
    });
}

export default router;
