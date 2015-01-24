var Task = require('../task');

var iTunesTask = function() {
  var self = this;
	self.credentials = require('./.credentials');
  Task.call(self, 'itunes');
  self.api = require('daap');
	self.api.host = self.credentials.host;
	self.api.port = self.credentials.port;
	self.api.pairingCode = self.credentials.pairingCode;

  // register commands
  self.register('play', self.play);
  self.register('pause', self.pause);
  self.register('stop', self.pause);
  self.register('next', self.next);
};
iTunesTask.prototype = Object.create(Task.prototype);
iTunesTask.prototype.constructor = iTunesTask;

iTunesTask.prototype.play = function() {
	console.log("iTunesTask play");
  var self = this;
  self.api.login(function (error, response) {
		if(!error) {
	  	sessionId = response['dmap.loginresponse']['dmap.sessionid'];
			console.log("daap sessionId: " + sessionId);
	    self.api.play(sessionId, function (error, response) {
	        //check error/response
	    });
		} else {
			console.log("iTunesTask.prototype.play: " + error); 
		}
	});
};

iTunesTask.prototype.pause = function() {
	console.log("iTunesTask pause");
  var self = this;
  self.api.login(function (error, response) {
  	sessionId = response['dmap.loginresponse']['dmap.sessionid'];
		console.log("daap sessionId: " + sessionId);
    self.api.pause(sessionId, function (error, response) {
        //check error/response
    });
	});
};

iTunesTask.prototype.next = function() {
	console.log("iTunesTask next");
  var self = this;
  self.api.login(function (error, response) {
  	sessionId = response['dmap.loginresponse']['dmap.sessionid'];
		console.log("daap sessionId: " + sessionId);
    self.api.nextitem(sessionId, function (error, response) {
        //check error/response
    });
	});
};

module.exports = iTunesTask;