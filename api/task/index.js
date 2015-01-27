var Task = function(prefix) {
  var self = this;
  self.prefix = prefix;
  self.commands = [];
};

Task.prototype.register = function(phrase, callback) {
  var self = this;
  // combines the prefix with a regex to find matches in the todo
  // list
  phrase = self.prefix + ' ' + phrase;
  var regex = new RegExp(phrase);
  self.commands.push({
    regex: regex,
    callback: callback
  });
	var regex2 = new RegExp('alexa ' + phrase);
  self.commands.push({
    regex: regex2,
    callback: callback
  });
};

Task.prototype.parse = function(task) {
  var self = this;
	if(!task.description) {
	  return task;
	}
  var activityDesc = JSON.parse(task.description);
	if(!activityDesc.summary) {
		return task;
	}
  var string = activityDesc.summary.toLowerCase();
  // filter on matches
  var matches = self.commands.filter(function(command) {
    return command.regex.test(string);
  });

  if(matches.length != 1) {
    return task;
  }

  var command = matches[0];
  var results = command.regex.exec(string);
  // there is almost definitely a better way to do this.
	console.log("command: " + results[0]);
  var params = results[1];
  console.log('Executing: %s with params: %s', string, params);
  command.callback.call(self, params);
  task.executed = true;
	var re = new RegExp( self.prefix, "i" );
  if ( re.test('itunes')) {
    task['mediaStop'] = true;
  }
	console.log("task string: " + JSON.stringify(task));
  return task;
}

module.exports = Task;
