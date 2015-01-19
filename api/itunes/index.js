var Task = require('../task');

var iTunesTask = function() {
  var self = this;
  Task.call(self, 'itunes');
  self.api = require('playback');

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
	self.api.play();
};

iTunesTask.prototype.pause = function() {
	console.log("iTunesTask pause");
  var self = this;
	self.api.pause();
};

iTunesTask.prototype.next = function() {
	console.log("iTunesTask next");
  var self = this;
	self.api.next();
};

module.exports = iTunesTask;