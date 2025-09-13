require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3000;
let derivWS = null;

// Connect to Deriv WebSocket
function connectDeriv() {
  const token = process.env.DERIV_API_KEY;
  derivWS = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=1089&api_token=${token}`);

  derivWS.on('open', () => {
    console.log('✅ Connected to Deriv API');
  });

  derivWS.on('message', (msg) => {
    let data = JSON.parse(msg.toString());
    console.log('📩 Data:', data);
    io.emit('deriv-data', data); // send data to frontend
  });

  derivWS.on('close', () => {
    console.log('⚠️ Deriv WebSocket closed, reconnecting...');
    setTimeout(connectDeriv, 5000);
  });
}

connectDeriv();

// Express route
app.get('/', (req, res) => {
  res.send('🚀 Astark Backend Running!');
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
