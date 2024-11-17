import express from "express";
import connection from "../db.js";

const router = express.Router();

// Ruta principal para renderizar OneScreen.ejs
router.get("/", async (req, res) => {
    try {
        const user = await getUserById(req.session.userId);
        const productos = await getProductos();
        const proveedores = await getProveedores();

        res.render("OneScreen", {
            user: user,
            productos: productos,
            proveedores: proveedores,
            vistaActual: req.query.vista || 'inicio'
        });
    } catch (error) {
        console.error("Error en OneScreen:", error);
        res.status(500).render("error", { message: "Error al cargar el dashboard" });
    }
});

// Obtener usuario por ID
const getUserById = (userId) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM Usuarios WHERE id = ?', [userId], (error, results) => {
            if (error) return reject(new Error('Error al buscar usuario: ' + error.message));
            if (results.length === 0) return reject(new Error('Usuario no encontrado'));
            resolve(results[0]);
        });
    });
};

// Obtener productos
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

            const processedResults = results.map(producto => ({
                ...producto,
                PrecioUnitario: Number(producto.PrecioUnitario)
            }));

            console.log('Productos recuperados:', processedResults);
            resolve(processedResults);
        });
    });
};

// Obtener proveedores
const getProveedores = () => {
    return new Promise((resolve, reject) => {
        const query = `SELECT id, Empresa FROM Proveedores`;

        connection.query(query, (error, results) => {
            if (error) return reject(new Error('Error al obtener proveedores: ' + error.message));
            resolve(results);
        });
    });
};

// Ruta para agregar un producto
router.post("/agregar-producto", async (req, res) => {
    try {
        const { nombreProducto, codigoProducto, stockProducto, precioProducto, proveedorProducto } = req.body;

        if (!nombreProducto || !codigoProducto || !stockProducto || !precioProducto) {
            return res.status(400).json({ error: "Todos los campos son requeridos" });
        }

        const query = `
            INSERT INTO Productos (Nombre, Codigo, Stock, PrecioUnitario, Proveedor) 
            VALUES (?, ?, ?, ?, ?)
        `;

        connection.query(
            query,
            [nombreProducto, codigoProducto, stockProducto, precioProducto, proveedorProducto || null],
            (error, results) => {
                if (error) {
                    console.error("Error MySQL:", error);
                    return res.status(500).json({ error: "Error al agregar producto" });
                }

                res.status(200).json({ success: true, message: "Producto agregado exitosamente" });
            }
        );
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

export default router;
