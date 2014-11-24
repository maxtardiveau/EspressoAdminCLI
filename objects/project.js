var Client = require('node-rest-client').Client;
var colors = require('colors');
var _ = require('underscore');
var CLITable = require('cli-table');
var Table = require('easy-table');

var context = require('./context.js');
var login = require('../util/login.js');
var printObject = require('../util/printObject.js');
var dotfile = require('../util/dotfile.js');

module.exports = {
	doProject: function(action, cmd) {
		if (action === 'list') {
			module.exports.list(cmd);
		}
		else if (action === 'create') {
			module.exports.create(cmd);
		}
		else if (action === 'update') {
			module.exports.update(cmd);
		}
		else if (action === 'delete') {
			module.exports.del(cmd);
		}
		else if (action === 'use') {
			module.exports.use(cmd);
		}
		else if (action === 'import') {
			module.exports.import(cmd);
		}
		else if (action === 'export') {
			module.exports.export(cmd);
		}
		else {
			console.log('You must specify an action: list, create, update, delete, use, import, or export');
			//program.help();
		}
	},
	
	list: function (cmd) {
		var client = new Client();
		
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;

		client.get(url + "/projects", {
			headers: {
				Authorization: "Espresso " + apiKey + ":1"
			}
		}, function(data) {
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			printObject.printHeader('All projects');
			var table = new Table();
			_.each(data, function(p) {
				table.cell("Name", p.name);
				table.cell("URL", p.url_name);
				var comments = p.comments;
				if ( ! comments) {
					comments = "";
				}
				else if (comments.length > 50){
					comments = comments.substring(0, 47) + "...";
				}
				table.cell("Comments", comments);
				table.newRow();
			});
			table.sort(['Name']);
			console.log(table.toString());
			printObject.printHeader("# projects: " + data.length);
		});
	},
	
	create: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		if ( ! cmd.name) {
			console.log('Missing parameter: name'.red);
			return;
		}
		if ( ! cmd.url_name) {
			console.log('Missing parameter: url_name'.red);
			return;
		}
		context.getContext(cmd, function() {
			//console.log('Current account: ' + JSON.stringify(context.account));
			
			var newProject = {
				name: cmd.name,
				url_name: cmd.url_name,
				status: 'A',
				account_ident: context.account.ident,
				comments: cmd.comments
			};
			
			if (cmd.status) {
				if (cmd.status !== 'A' && cmd.status !== 'I') {
					console.log('Project status must be either A (for active) or I (for inactive). Default is A if unspecified.'.red);
					return;
				}
				newProject.status = cmd.status;
			}

			
			var startTime = new Date();
			client.post(loginInfo.url + "/projects", {
				data: newProject,
				headers: {
					Authorization: "Espresso " + loginInfo.apiKey + ":1"
				}
			}, function(data) {
				var endTime = new Date();
				if (data.errorMessage) {
					console.log(data.errorMessage.red);
					return;
				}
				printObject.printHeader('Project was created, including:');
				var newProj = _.find(data.txsummary, function(p) {
					return p['@metadata'].resource === 'admin:projects';
				});
				if ( ! newProj) {
					console.log('ERROR: unable to find newly created project'.red);
					return;
				}
				if (cmd.verbose) {
					_.each(data.txsummary, function(obj) {
						printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
					});
				}
				else {
					printObject.printObject(newProj, newProj['@metadata'].entity, 0, newProj['@metadata'].verb);
					console.log(('and ' + (data.txsummary.length - 1) + ' other objects').grey);
				}
				var trailer = "Request took: " + (endTime - startTime) + "ms";
				trailer += " - # objects touched: ";
				if (data.txsummary.length == 0) {
					console.log('No data returned'.yellow);
				}
				else {
					trailer += data.txsummary.length;
				}
				printObject.printHeader(trailer);
				
				dotfile.setCurrentProject(newProj.ident, cmd.name);
			});
		});
	},
	
	update: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;

		var filter = null;
		if (cmd.name) {
			filter = "name='" + cmd.name + "'";
		}
		else if (cmd.url_name) {
			filter = "url_name='" + cmd.url_name + "'";
		}
		else {
			console.log('Missing parameter: please specify either name or url_name'.red);
			return;
		}
		
		client.get(loginInfo.url + "/projects?filter=" + filter, {
			headers: {
				Authorization: "Espresso " + loginInfo.apiKey + ":1"
			}
		}, function(data) {
			//console.log('get result: ' + JSON.stringify(data, null, 2));
			if (data.errorMessage) {
				console.log(("Error: " + data.errorMessage).red);
				return;
			}
			
			if (data.length === 0) {
				console.log(("Error: no such project").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one project for the given condition: " + filter).red);
				return;
			}
			var project = data[0];
			if (cmd.name) {
				project.name = cmd.name;
			}
			if (cmd.url_name) {
				project.url_name = cmd.url_name;
			}
			if (cmd.comments) {
				project.comments = cmd.comments;
			}
			if (cmd.status) {
				if (cmd.status !== 'A' && cmd.status !== 'I') {
					console.log('Project status must be either A (for active) or I (for inactive). Default is A if unspecified.'.red);
					return;
				}
				project.status = cmd.status;
			}
			
			var startTime = new Date();
			client.put(project['@metadata'].href, {
				data: project,
				headers: {
					Authorization: "Espresso " + loginInfo.apiKey + ":1"
				}
			}, function(data) {
				var endTime = new Date();
				if (data.errorMessage) {
					console.log(data.errorMessage.red);
					return;
				}
				printObject.printHeader('Project was updated, including the following objects:');
				_.each(data.txsummary, function(obj) {
					printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
				});
				var trailer = "Request took: " + (endTime - startTime) + "ms";
				trailer += " - # objects touched: ";
				if (data.txsummary.length == 0) {
					console.log('No data returned'.yellow);
				}
				else {
					trailer += data.txsummary.length;
				}
				printObject.printHeader(trailer);
			});
		});
	},
	
	del : function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo) {
			console.log('You are not currently logged into any Espresso Logic server.'.red);
			return;
		}

		var filt = null;
		if (cmd.url_name) {
			filt = "url_name='" + cmd.url_name + "'";
		}
		else if (cmd.name) {
			filt = "name='" + cmd.name + "'";
		}
		else {
			console.log('Missing parameter: please specify either name or url_name'.red);
			return;
		}
		
		client.get(loginInfo.url + "/projects?filter=" + filt, {
			headers: {
				Authorization: "Espresso " + loginInfo.apiKey + ":1"
			}
		}, function(data) {
			//console.log('get result: ' + JSON.stringify(data, null, 2));
			if (data.errorMessage) {
				console.log(("Error: " + data.errorMessage).red);
				return;
			}
			if (data.length === 0) {
				console.log(("Error: no such project").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one project for the given condition: " + filter).red);
				return;
			}
			var project = data[0];
			var startTime = new Date();
			client['delete'](project['@metadata'].href + "?checksum=" + project['@metadata'].checksum, {
				headers: {
					Authorization: "Espresso " + loginInfo.apiKey + ":1"
				}
			}, function(data2) {
				var endTime = new Date();
				if (data2.errorMessage) {
					console.log(data2.errorMessage.red);
					return;
				}
				printObject.printHeader('Project was deleted, including the following objects:');
				_.each(data2.txsummary, function(obj) {
					printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
				});
				var trailer = "Request took: " + (endTime - startTime) + "ms";
				trailer += " - # objects touched: ";
				if (data2.txsummary.length == 0) {
					console.log('No data returned'.yellow);
				}
				else {
					trailer += data2.txsummary.length;
				}
				printObject.printHeader(trailer);
			});
		});
	},
	
	use: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;

		var filter = null;
		if (cmd.url_name) {
			filter = "url_name='" + cmd.url_name + "'";
		}
		else if (cmd.name) {
			filter = "name='" + cmd.name + "'";
		}
		else {
			console.log('Missing parameter: please specify either name or url_name'.red);
			return;
		}
		
		client.get(loginInfo.url + "/projects?filter=" + filter, {
			headers: {
				Authorization: "Espresso " + loginInfo.apiKey + ":1"
			}
		}, function(data) {
			//console.log('get result: ' + JSON.stringify(data, null, 2));
			if (data.errorMessage) {
				console.log(("Error: " + data.errorMessage).red);
				return;
			}
			if (data.length === 0) {
				console.log(("Error: no such project").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one project for the given condition: " + filter).red);
				return;
			}
			var project = data[0];
			dotfile.setCurrentProject(project.ident, project.name);
		});
	}
};
