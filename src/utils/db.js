const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: '34.27.144.103',
    database: 'modelos',
    password: '1234',
    port: 5432
});

// Función para iniciar la conexión a la base de datos
async function connectDB() {
    try {
        await client.connect();
    } catch (err) {
        console.error('Error al conectar a la base de datos:', err);
    }
}

// Función para iniciar una transacción
async function transaccion() {
    try {
        await client.query('BEGIN');
    } catch (err) {
        console.error('Error al iniciar la transacción:', err);
        throw err;
    }
}

// Función para confirmar una transacción
async function commit() {
    try {
        await client.query('COMMIT');
    } catch (err) {
        console.error('Error al confirmar la transacción:', err);
        throw err;
    }
}

// Función para deshacer una transacción
async function rollback() {
    try {
        await client.query('ROLLBACK');
    } catch (err) {
        console.error('Error al deshacer la transacción:', err);
        throw err;
    }
}

// Exportar los métodos necesarios
module.exports = {
    connectDB,
    transaccion,
    commit,
    rollback,
    client
};
