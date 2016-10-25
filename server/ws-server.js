// 'use strict';
//
// let WsServer = require('ws').Server;
// let server = require('https');
// let cfg = require('./config.js');
//
// const CLIENTS = new Map();
//
// let options = {
//   key: fs.readFileSync(cfg.key),
//   cert: fs.readFileSync(cfg.cert)
// };
//
// let wss = new WsServer({
//   server: https.createServer(options)
// });
//
// wss.on('connection', function connection(ws) {
//   ws.on('message', function incoming(message) {
//     switch (message.data.type) {
//       case 'register':
//         CLIENTS.add(message.data.user, ws);
//         break;
//       case 'offer':
//         CLIENTS.forEach(function each(client) {
//           if (client !== ws) {
//             client.send(message.data, function ack(er) {
//               if (er) {
//                 console.log('Error communicating with client. Removing..');
//                 CLIENTS.remove(client);
//               }
//             }));
//           }
//         });
//         break;
//       case 'answer':
//         CLIENTS.get(message.data.targetUser).send(message.data, function ack(er) {
//           if (er) {
//             console.log('Error communicating with client. Removing..');
//             CLIENTS.remove(client);
//           }
//         });
//         break;
//       case 'new-ice-candidate':
//         CLIENTS.forEach(function each(client) {
//           if (client !== ws) {
//             client.send(message.data, function ack(er) {
//               if (er) {
//                 console.log('Error communicating with client. Removing..');
//                 CLIENTS.remove(client);
//               }
//             });
//           }
//         });
//         break;
//       default:
//     }
//   });
// });
