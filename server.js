const path = require('path');
const fs   = require('fs');
const express = require('express');
const { Server } = require('socket.io');

const app = express();

// Pega a pasta onde o exe está rodando (ou, em dev, cai pra processo normal)
const baseDir = process.pkg
  ? path.dirname(process.execPath)
  : __dirname;

// caminhos absolutos pros arquivos externos
const currentTxt = path.join(baseDir, 'current.txt');
const pautasJson = path.join(baseDir, 'pautas.json');
const publicDir  = path.join(baseDir, 'public');

// serve a pasta public que agora é externa
app.use(express.static(publicDir));

let current = '';
try {
  current = fs.readFileSync(currentTxt, 'utf8');
} catch (err) {
  console.warn('Não achei current.txt, iniciando vazio');
}

const server = app.listen(3000, () => {
  console.log('ouvindo na porta 3000');
});

const io = new Server(server);

io.on('connection', socket => {
  // ao conectar, já dispara o valor atual
  socket.emit('update', current);

  socket.on('select', text => {
    current = text;
    // escreve de volta pro arquivo externo
    fs.writeFileSync(currentTxt, current, 'utf8');
    io.emit('update', current);
  });
});
