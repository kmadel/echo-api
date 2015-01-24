var Echo = function() {
  var self = this;
  self.credentials = require('./.credentials');
  self.domain = 'https://pitangui.amazon.com';
	self.deviceType = 'AB72C64C86AW2';
	self.deviceSerialNumber = 'B0F00712446401G7';
	var deviceInfo = {};
	deviceInfo['deviceType'] = self.deviceType;
	deviceInfo['deviceSerialNumber'] = self.deviceSerialNumber;
	self.deviceInfo = deviceInfo;
  self.tasksToFetch = 5;
  self.apis = [];
  self.tasks = [];
};

Echo.prototype.request = function(api, method, params, data, callback) {
  var self = this;
  var url = '';
  url += self.domain;
  url += '/api/' + api;

  var headers = {
    'Cookie': self.credentials.cookie,
    'User-Agent': 'User Agent/0.0.1'
  };

  var options = {
    url: url,
    method: method,
    headers: headers,
    qs: params
  };

  if(data) {
    options.body = JSON.stringify(data);
    options.headers['Content-Type'] = 'application/json';
    options.headers['Origin'] = 'http://echo.amazon.com';
    options.headers['Referer'] = 'http://echo.amazon.com/spa/index.html';
    options.headers['csrf'] = self.credentials.csrf;
  }

  var req = require('request');
  req(options, function(err, res, body) {
    if(!err && res.statusCode == 200) {
      callback.call(self, body);
    } else {
      console.log('err!');
			if(res && res.statusCode) {
        console.log(err, res.statusCode, body);
		  }
    }
  });
};

Echo.prototype.get = function(api, params, callback) {
  var self = this;
  self.request(api, 'GET', params, null, callback);
};

Echo.prototype.post = function(api, params, data, callback) {
  var self = this;
  self.request(api, 'POST', params, data, callback);
};

Echo.prototype.delete = function(api, params, data, callback) {
  var self = this;
  self.request(api, 'DELETE', params, data, callback);
};

Echo.prototype.fetchTasks = function() {
  var self = this;
  self.busy = true;
  self.get('activities', {
    startTime:'',
		offset: 1,
    size: self.tasksToFetch
  }, function(body) {
    var json = JSON.parse(body);
    var tasks = json.activities;

    var oldStr = JSON.stringify(self.tasks);
    var newStr = JSON.stringify(tasks);

    if(oldStr != newStr) {
      self.tasks = tasks;
      self.parseTasks();
    }
  });
};

Echo.prototype.parseTasks = function() {
  var self = this;
  console.log('%d tasks found.', self.tasks.length);

  // TODO: fix this super inefficient code.
  var tasks = self.tasks;
  for(var i in self.apis) {
    var api = self.apis[i];
    for(var j in tasks) {
      var task = tasks[j];
      tasks[j] = api.parse(task);
    }
  }

  self.cleanupTasks(tasks);
};

Echo.prototype.cleanupTasks = function(tasks) {
  var self = this;

  var cleanup = tasks.filter(function(task) {
    return task.executed;
  });

  for(var i in cleanup) {
    var task = cleanup[i];
		if(task.mediaStop) {
			console.log('mediaStop set to true')
			self.post('media/stop', null, self.deviceInfo,function(res) {
      // TODO maybe put something here
    });
		}
    task.deleted = true;
    delete task.executed;
    console.log('Deleting: %s', task.id);
    self.delete('activities/' + encodeURIComponent(task.id), null, task, function(res) {
      // TODO maybe put something here
    });
  }
};

module.exports = Echo;
