function init() {
  let mouse = {
    click: false,
    move: false,
    pos: { x: 0, y: 0},
    pos_prev: false
  };

  // Canvas
  let canvas = document.getElementById('drawing');
  let context = canvas.getContext('2d');
  let width = window.innerWidth;
  let height = window.innerHeight;
  
  // Socket IO
  let socket;
  socket = io.connect('https://pf-modelos-de-programacion-ii-production.up.railway.app/',{
    auth: {
      token: localStorage.getItem('token')
    }
  })

  socket.on('authSuccess', (data) => {
    Swal.fire(
      'Bien hecho!',
      'Autenticación exitosa!',
      'success'
    ) // Autenticación exitosa
  });
  
  socket.on('authFailure', (data) => {
    Swal.fire(
      'Error!',
      'Logueate por favor >:c!',
      'error'
    )// Token de autenticación inválido
    window.location.href = '/login.html'
  });

  // Boton de reinicio 
  document.getElementById('btn').addEventListener('click', (event) => {
    socket.emit('eliminar')
    location.reload();
  })

  // Tamaño total del canvas
  canvas.width = width;
  canvas.height = height;

  canvas.addEventListener('mousedown', (e) => {
    mouse.click = true;
  });

  canvas.addEventListener('mouseup', (e) => {
    mouse.click = false;
  });

  canvas.addEventListener('mousemove', e => {
    mouse.pos.x = e.clientX / width;
    mouse.pos.y = e.clientY / height;
    mouse.move = true;
  });

  socket.on('draw_line', data => {
    let line = data.line;
    context.beginPath();
    context.lineWidth = 2;
    context.moveTo(line[0].x * width, line[0].y * height);
    context.lineTo(line[1].x * width, line[1].y * height);
    context.stroke();
  });

  function mainLoop() {
    if(mouse.click && mouse.move && mouse.pos_prev) {
      socket.emit('draw_line', { line: [mouse.pos, mouse.pos_prev] });
      mouse.move = false;
    }
    mouse.pos_prev = { x: mouse.pos.x, y: mouse.pos.y };
    setTimeout(mainLoop, 25);
  }

  mainLoop();
}

document.addEventListener('DOMContentLoaded', init);
