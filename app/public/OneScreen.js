import express from "express";
import connection from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const user = await getUserById(req.session.userId);
        const productos = await getProductos();

        res.render("OneScreen", {
            user: user,
            productos: productos,
            vistaActual: req.query.vista || 'inicio'
        });
    } catch (error) {
        console.error("Error en OneScreen:", error);
        res.status(500).render("error", { message: "Error al cargar el dashboard" });
    }
});

const getUserById = (userId) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM Usuarios WHERE id = ?', [userId], (error, results) => {
            if (error) return reject(new Error('Error al buscar usuario: ' + error.message));
            if (results.length === 0) return reject(new Error('Usuario no encontrado'));
            resolve(results[0]);
        });
    });
};

const getProductos = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                p.id,
                p.Nombre,
                p.Codigo,
                p.Stock,
                CAST(p.PrecioUnitario AS DECIMAL(10,2)) as PrecioUnitario,
                pr.Empresa as NombreProveedor 
            FROM Productos p 
            LEFT JOIN Proveedores pr ON p.Proveedor = pr.id
        `;
        
        connection.query(query, (error, results) => {
            if (error) return reject(new Error('Error al obtener productos: ' + error.message));
            
            // Convertir los resultados y asegurarse de que PrecioUnitario sea un número
            const processedResults = results.map(producto => ({
                ...producto,
                PrecioUnitario: Number(producto.PrecioUnitario)
            }));
            
            console.log('Productos recuperados:', processedResults);
            resolve(processedResults);
        });
    });
};

router.post("/agregar-proveedor", async (req, res) => {
    try {
        console.log('Datos recibidos en el servidor:', req.body);
        const { empresa, encargado, telefono, email, rut, direccion } = req.body;

        if (!empresa || !encargado || !telefono || !email || !rut || !direccion) {
            return res.status(400).json({ error: "Todos los campos son requeridos" });
        }

        const query = `
            INSERT INTO Proveedores (Empresa, Encargado, Telefono, Email, Rut, Direccion) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        connection.query(query, [empresa, encargado, telefono, email, rut, direccion], (error, results) => {
            if (error) {
                console.error('Error MySQL:', error);
                return res.status(500).json({ error: "Error al registrar proveedor en la base de datos", details: error.message });
            }

            res.status(200).json({ success: true, message: "Proveedor registrado exitosamente", id: results.insertId });
        });
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ error: "Error interno del servidor", details: error.message });
    }
});

export default router;
