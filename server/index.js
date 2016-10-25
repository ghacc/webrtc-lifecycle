"use strict";

var http = require('http');
var https = require('https');
let WsServer = require('ws').Server;
var fs = require('fs');
var cfg = require('./config.js');
let app = require('./http-server');

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
        CLIENTS.add(message.user, ws);
        break;
      case 'offer':
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
      case 'answer':
        CLIENTS.get(message.targetUser).send(message, function ack(er) {
          if (er) {
            console.log('Error communicating with client. Removing..');
            CLIENTS.remove(client);
          }
        });
        break;
      case 'new-ice-candidate':
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
      default:
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
