'use strict';

// Ice servers for the peer connection. Only a stun server is provided (a
// google's one). No point in offering a turn relay server as this would defeat
// the purpose of the project.
const ICE_SERVERS = {iceServers: [{urls: 'stun:stun.l.google.com:19302'}]};
// Peer connection options
const connectionOptions = {'optional': [{'DtlsSrtpKeyAgreement': true}, {'RtpDataChannels': true }]};
// Websocket with the signalling server
const SOCKET = new WebSocket('wss://snf-726404.vm.okeanos.grnet.gr:8443/');
// const SOCKET = new WebSocket('wss://localhost:8443/');
// Array of possible message types (from signalling server)
const SIGNAL_MESSAGE_TYPES = ['answer', 'offer', 'new-ice-candidate', 'register', 'relay-message'];
// A map of all the connection that the client holds
const CONNECTIONS = new Map();
// An id for the client
const MY_ID = uid.get();

SOCKET.addEventListener('open', function() {
  l.i('Connection with signalling server open');
});

SOCKET.addEventListener('error', function(er) {
  l.e('Connection with signalling server errored');
  console.dir(er);
});

SOCKET.addEventListener('close', function() {
  l.e('Connection with singalling server closed');
});

// Here we handle our communication with the signalling server. The signalling
// may notify us for a new offer or a new ice candidate.
SOCKET.addEventListener('message', function(e) {
  l.i('Message from signalling server');
  console.dir(e);
  let data = JSON.parse(e.data);
  if (!data.type || SIGNAL_MESSAGE_TYPES.indexOf(data.type) == -1) {
    l.w("Message from signalling server does contain proper type");
    console.dir(data);
    return;
  }
  switch (data.type) {
    case 'offer':
      createAnswer(data);
      break;
    case 'answer':
      // Ti kano otan pairnw apantisi se offer?
      handleAnswer(data);
      break;
    case 'new-ice-candidate':
      handleRemoteIceCandidate(data);
      break;
    case 'relay-message':
      addLog(server, data.content);
      break;
  }
  if (data.targetUser !== MY_ID && data.sdp) {
    createAnswer(new RTCSessionDescription(sdp));
  }
});

SOCKET.addEventListener('error', function(er) {
  l.e('Error when connecting to signalling server');
  console.dir(er);
});

SOCKET.addEventListener('close', function() {
  l.i('Connection with signalling server closed');
});


function startConnection() {
  let peerConnection = new RTCPeerConnection(ICE_SERVERS, connectionOptions);
  peerConnection.onicecandidate = handleIceCandidateEvent;
  let dc = peerConnection.createDataChannel("datachannel", {reliable: false});
  dc.onopen = handleOpenDirectConnection;
  dc.onmessage = handleDirectMessage;
  dc.onclose = handleCloseDirectConnection;
  dc.onerror = handleErrorDirectConnection;
  l.i('Creating an RTC Session Description object that describes the generated offer');
  let offer = peerConnection.createOffer();

  // Once the offer is created set it as the local description
  offer.then(function(sessionDescription) {
    l.i('RTC Session Description successfully created');
    console.dir(sessionDescription);
    return peerConnection.setLocalDescription(sessionDescription);
  }, function(er) {
    l.e('Failed to create RTC Session Description');
    console.dir(er);
  })
  // Send offer through the signalling server
  .then(function() {
    l.i('Sending RTC Session Description to signalling server');
    let message = {
      type: "offer",
      originUser: MY_ID,
      sdp: peerConnection.localDescription
    };
    console.dir(message);
    SOCKET.send(JSON.stringify(message));
  }, function(er) {
    l.e('Failed to set local description');
    console.dir(er);
  });
}

function createAnswer(data) {
  let peerConnection = new RTCPeerConnection(ICE_SERVERS, connectionOptions);
  peerConnection.onicecandidate = handleIceCandidateEvent;
  let dc = peerConnection.createDataChannel("datachannel", {reliable: false});
  dc.onopen = handleOpenDirectConnection;
  dc.onmessage = handleDirectMessage;
  dc.onclose = handleCloseDirectConnection;
  dc.onerror = handleErrorDirectConnection;
  l.i('Creating an RTC Session Description object for received offer');

  // Set remote description from offer received
  peerConnection.setRemoteDescription(data.sdp).then(function() {
    return peerConnection.createAnswer();
  }, function() {
    l.e('Failed to set remote description');
    console.dir(e);
  })
  // Set local description
  .then(function(answer) {
    return peerConnection.setLocalDescription(answer);
  }, function() {
    l.e('Failed to create RTC Session Description');
    console.dir(e);
  })
  // Send answer through the signalling server
  .then(function() {
    l.i('Sending RTC Session Description to signalling server');
    let message = {
      type: "answer",
      originUser: MY_ID,
      targetUser: data.originUser,
      sdp: peerConnection.localDescription
    };
    console.dir(message);
    SOCKET.send(JSON.stringify(message));
  }, function(er) {
    l.e('Failed to set local description');
    console.dir(er);
  });
}

function handleAnswer(data) {
  // getPeerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
}

// Once this client's ICE agent has a candidate, we must send it to the
// signalling server
function handleIceCandidateEvent(event) {
  if (event.candidate) {
    let message = {
      type: "new-ice-candidate",
      originUser: MY_ID,
      candidate: event.candidate
    };
    l.i('Sending ICE candidate to signalling server');
    console.dir(message);
    SOCKET.send(JSON.stringify(message));
  }
}

// Add the remote Ice candidate we received for the remote user from the
// signalling server
function handleRemoteIceCandidate(data) {
  let remoteCandidate = new RTCIceCandidate(data.candidate);
  let peerConnection = CONNECTIONS.get(data.originUser);
  if (!peerConnection) {
    l.w("Received Ice Candidate from user that we don't hold a connection with");
    console.dir(CONNECTIONS);
    console.dir(data);
    return;
  }

  peerConnection.addIceCandidate(remoteCandidate).catch(function(er) {
    l.w("Failed to set remote Ice candidate for " + originUser);
  });
}

function registerWithServer() {
  let message = {
    type: 'register',
    user: MY_ID
  };
  try {
    SOCKET.send(JSON.stringify(message));
  } catch (ex) {
    l.e('Failed to register with server');
    console.dir(ex);
  }
}

function handleDirectMessage(e) {
  addLog(self, e.data);
}

function handleOpenDirectConnection() {
  addLog(self, 'Direct channel established!');
  console.log(this);
}

function handleCloseDirectConnection() {
  addLog(self, 'Direct channel closed!');
}

function handleErrorDirectConnection() {
  addLog(self, 'Error in direct connection!');
}
