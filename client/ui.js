'use strict';

let meLabel = document.getElementById('me');
let tooltip = document.getElementById('tooltip');
meLabel.innerHTML = MY_ID + '(me)';
meLabel.addEventListener('mouseover', function() {
  tooltip.style.display = 'initial';
});
meLabel.addEventListener('mouseout', function() {
  tooltip.style.display = 'none';
});
meLabel.addEventListener('mousedown', function() {
  l.i("Label clicked - trying to connect to websocket server");
  this.disabled = true;
  l.i("Starting connection")
  startConnection();
});
