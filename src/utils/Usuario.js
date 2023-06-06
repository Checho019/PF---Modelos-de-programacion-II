const db = require('./db')
const crypto = require('crypto')

db.connectDB()

// Validar si existe el usuario
const existe = async (email) => {
    let query = 'SELECT email FROM "usuario" WHERE email = $1'
    const result = await db.client.query(query, [email]);
    return result.rows.length !== 0;
}

// Validar correo y contraseña
const validar = async (user) => {
    const {email, password } = user
    let query = 'SELECT email FROM "usuario" WHERE email = $1 AND password = $2'
    const result = await db.client.query(query, [email, cifrarContrasenaMD5(password)]);
    return result.rows.length !== 0 ? true : null;
}

// Registrar usuario
const agregarUsuario = async (user) => {
    try {
        const {email, password } = user
        let usuario = `INSERT INTO "usuario" VALUES ($1,$2)`
        await db.transaccion();
        await db.client.query(usuario, [email, cifrarContrasenaMD5(password)])

        await db.commit()
    } catch (error) {
        await db.rollback()
        throw error
    }
}

// Encriptar una contraseña con MD5
const cifrarContrasenaMD5 = (contrasena) => {
    const hash = crypto.createHash('md5');
    hash.update(contrasena);
    return hash.digest('hex');
}

module.exports = {
    existe,
    validar,
    agregarUsuario
}