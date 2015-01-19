var Echo = require('./api/echo');
var TCPApi = require('./api/tcp');
var iTunesApi = require('./api/itunes');

var myEcho = new Echo();

myEcho.apis.push(new TCPApi());
myEcho.apis.push(new iTunesApi())

setInterval(function() {
  myEcho.fetchTasks();
}, 1500);
