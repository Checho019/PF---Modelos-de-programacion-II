const jwt = require('jsonwebtoken')

module.exports = io => {

  // Historial de lineas
  let line_history = [];

  io.on('connection', (socket) => {
    // Obtener el token de autenticación del handshake
    const token = socket.handshake.auth.token;

    // Verificar el token
    try {
      const decoded = jwt.verify(token, 'frijoles');

      // Autenticacion realizada
      socket.emit('authSuccess', { message: 'Autenticación exitosa' });

      for (let i in line_history) {
        socket.emit('draw_line', { line: line_history[i] });
      }
  
      socket.on('draw_line', data => {
        line_history.push(data.line);
        io.emit('draw_line', { line: data.line });
      });

      socket.on('eliminar', data => {
        line_history = []
      })

    } catch (error) {
      // Si el token no es válido, manejar el error
      socket.emit('authFailure', { error: 'Token de autenticación inválido' });
      socket.disconnect(true);
    }
  });


};
