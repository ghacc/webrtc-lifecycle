"use strict";

let http = require('http');
let https = require('https');
let WsServer = require('ws').Server;
let fs = require('fs');
let cfg = require('./config.js');
let app = require('./http-server');
const CLIENTS = new Map();

let options = {
  key: fs.readFileSync(cfg.key),
  cert: fs.readFileSync(cfg.cert)
};


let httpServer = http.createServer();
let httpsServer = https.createServer(options);

let wss = new WsServer({
  server: httpsServer
});


wss.on('connection', function connection(ws) {
  console.log('A websocket connection established');
  ws.on('message', function incoming(message) {
    console.dir(message);
    switch (message.type) {
      case 'register':
        console.log("Registering user " + message.user + " with the server.");
        broadcast_message("Registering user " + message.user + " with the server.");
        CLIENTS.add(message.user, ws);
        break;
      case 'offer':
        CLIENTS.forEach(function each(client) {
          if (client !== ws) {
            broadcast_message('Sending offer from ' + message.originUser);
            client.send(message, function ack(er) {
              if (er) {
                console.log('Error communicating with client. Removing..');
                CLIENTS.remove(client);
              }
            });
          }
        });
        break;
      case 'answer':
        broadcast_message('Sending answer from ' + message.originUser + ' to ' + message.targetUser);
        CLIENTS.get(message.targetUser).send(message, function ack(er) {
          if (er) {
            console.log('Error communicating with client. Removing..');
            CLIENTS.remove(client);
          }
        });
        break;
      case 'new-ice-candidate':
        broadcast_message('Sending new ICE candidates from ' + message.originUser);
        CLIENTS.forEach(function each(client) {
          if (client !== ws) {
            client.send(message, function ack(er) {
              if (er) {
                console.log('Error communicating with client. Removing..');
                CLIENTS.remove(client);
              }
            });
          }
        });
        break;
    }
  });
});

httpServer.on('request', app);
httpsServer.on('request', app);

httpServer.listen(cfg.insecurePort, function() {
  console.log('Server listening on port ' + cfg.insecurePort);
});
httpsServer.listen(cfg.securePort, function() {
  console.log('Secure server listening on port ' + cfg.securePort);
});

function broadcast_message(content) {
  let message = JSON.stringify({type: "relay-message", content: content});
  CLIENTS.forEach(function(client) {
    client.send(message);
  });
}
