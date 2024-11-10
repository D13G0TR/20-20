import mysql from "mysql";
import dotenv from "dotenv";

dotenv.config();

// Configuración del pool de conexiones
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'restaurante',
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
});

// Verificar la conexión
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Se perdió la conexión con la base de datos.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('La base de datos tiene demasiadas conexiones.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('La conexión a la base de datos fue rechazada.');
        }
    }
    if (connection) {
        console.log('Conexión a la base de datos establecida');
        connection.release();
    }
});

export default pool;
