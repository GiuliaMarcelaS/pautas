const fs = require('fs');
const path = require('path');
const os = require('os');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// função que encontra o primeiro IPv4 não-interno
function getLocalExternalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const TXT_PATH = path.join(process.cwd(), 'current.txt');
const PORT = process.env.PORT || 3000;

// garante que exista o arquivo
if (!fs.existsSync(TXT_PATH)) {
  fs.writeFileSync(TXT_PATH, '', 'utf8');
}

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
  const current = fs.readFileSync(TXT_PATH, 'utf8');
  socket.emit('update', current);
  socket.on('select', text => {
    fs.writeFileSync(TXT_PATH, text, 'utf8');
    io.emit('update', text);
  });
});

http.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalExternalIP();
  console.log(`Servidor rodando em http://${ip}:${PORT}/`);
});
