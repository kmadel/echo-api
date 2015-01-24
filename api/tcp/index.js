var Task = require('../task');
var TCPConnected = require('./node-tcp');
var TcpTask = function() {
  var self = this;
  Task.call(self, 'lights');
  self.bridge = null;
  self.api = null;
  self.lights = null;
  self.connected = false;
  self.tcp = new TCPConnected('10.0.1.25');

  // register commands
  self.register('on (.*)', self.turnOn);
  self.register('off (.*)', self.turnOff);
  self.register('scene (.*)', self.setScene);
};
TcpTask.prototype = Object.create(Task.prototype);
TcpTask.prototype.constructor = TcpTask;

TcpTask.prototype.turnOn = function(room) {
	console.log("turnOn room: " + room);
  var self = this;
  self.tcp.TurnOnRoomByName(room);
};

TcpTask.prototype.turnOff = function(room) {
	console.log("turnOff room: " + room);
  var self = this;
  self.tcp.TurnOffRoomByName(room);
};

TcpTask.prototype.setScene = function(scene) {
  var self = this;
	self.tcp.SceneRunByName(scene);
};

module.exports = TcpTask;