'use strict';

let server = document.querySelector('#server');
let self = document.querySelector('#self');
let usernameSelf = document.querySelector('#self h3');
usernameSelf.innerHTML = MY_ID + '(this browser)';

let connectButton = document.querySelector('#self button');
connectButton.addEventListener('mousedown', function() {
  l.i("Button clicked - trying to connect to websocket server");
  this.textContent = "Connecting..";
  this.disabled = true;
  l.i("Starting websocket connection");
  registerWithServer();
  startConnection();
});

function addLog(where, what) {
  let cache = new Map();
  if (!cache.has(where)) {
    cache.set(where, where.querySelector('dl'));
  }
  let target = cache.get(where);

  let dd = document.createElement("dd");
  dd.appendChild(document.createTextNode(what));
  target.insertBefore(dd, target.childNodes[0]);

  let time = new Date();
  let dt = document.createElement("dt");
  dt.appendChild(document.createTextNode(pad(time.getHours(), 2) + ":" + pad(time.getMinutes(), 2) + ":" + pad(time.getSeconds(), 2) + ":" + pad(time.getMilliseconds(), 3)));
  target.insertBefore(dt, target.childNodes[0]);
}

function pad(input, length) {
  let s = input.toString();
  if (s.length < length) {
    let count = length - s.length;
    let prefix = new Array(count).fill('0').join('');
    s = prefix + s;
  }
  return s;
}
