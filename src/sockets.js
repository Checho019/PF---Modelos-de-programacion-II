const jwt = require('jsonwebtoken')

module.exports = io => {

  // keep track of all lines that client sends
  let line_history = [];

  io.on('connection', (socket) => {
    // Obtener el token de autenticación del handshake
    const token = socket.handshake.auth.token;

    // Verificar el token
    try {
      const decoded = jwt.verify(token, 'frijoles');
      const email = decoded.email;
      console.log(email)

      // Emitir un evento personalizado al cliente
      socket.emit('authSuccess', { message: 'Autenticación exitosa' });

      for (let i in line_history) {
        socket.emit('draw_line', { line: line_history[i] });
      }
  
      socket.on('draw_line', data => {
        line_history.push(data.line);
        io.emit('draw_line', { line: data.line });
      });

    } catch (error) {
      // Si el token no es válido, manejar el error
      socket.emit('authFailure', { error: 'Token de autenticación inválido' });
      socket.disconnect(true);
    }
  });


};
