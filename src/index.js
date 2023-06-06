const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

// Traer servicio de usuarios
const usuarios = require('./utils/Usuario');
const { Socket } = require('dgram');

// iniciar
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Config
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
const secretKey = 'frijoles';

// static files
app.use(express.static(path.join(__dirname, 'public')));

// Registrar usuario
app.post('/registrar', async (req, res) => {
  try {
    const {email} = req.body
    // Verificar si el usuario ya existe
    const existe = await usuarios.existe(email);
    if (existe) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Crear un nuevo usuario en la base de datos
    await usuarios.agregarUsuario(req.body)

    // Generar un token JWT
    const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });

    // Devolver el token al cliente
    res.json({ token });
  } catch (error) {
    console.error('Error al registrar usuario', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ingreso de usuarios
app.post('/ingresar', async (req, res) => {
  try {
    const {email} = req.body
    // Buscar el usuario en la base de datos
    const existe = await usuarios.existe(email)
    if (!existe) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar la contraseña
    const passwordMatch = await usuarios.validar(req.body);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar un token JWT
    const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });

    // Devolver el token al cliente
    res.json({ token });
  } catch (error) {
    console.error('Error al iniciar sesión', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Middleware para verificar el token JWT 
const verificarToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Token de autenticación no proporcionado' });
  }
  const tokenPuro = token.split(" ")[1];
  jwt.verify(tokenPuro, secretKey , (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token de autenticación inválido' });
    }
    req.email = decoded.email;
    next();
  });
};

// sockets
io.use((socket, next) => {
  
  const token = socket.handshake.query.token;
  if (!token) {
    //return next(new Error('Token de autenticación no proporcionado'));
  }

  console.log('acceso')

  next();
})
require('./sockets')(io);

// Ruta protegida para obtener información del usuario
app.get('/user', verificarToken, (req, res) => {
  // Obtener el nombre de usuario a partir del token decodificado
  const email = req.email;
  // Realizar cualquier lógica adicional requerida
  // Devolver la respuesta al cliente
  res.json({ email });
});

// starting the server
server.listen(app.get('port'), () => {
  console.log('Server on port', app.get('port'));
});
