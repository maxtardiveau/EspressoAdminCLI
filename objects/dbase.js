var Client = require('node-rest-client').Client;
var colors = require('colors');
var _ = require('underscore');
var Table = require('easy-table');

var context = require('./context.js');
var login = require('../util/login.js');
var printObject = require('../util/printObject.js');
var dotfile = require('../util/dotfile.js');

module.exports = {
	doDbase: function(action, cmd) {
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
		else {
			console.log('You must specify an action: list, create, update or delete');
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
		
		var projIdent = cmd.project_ident;
		if ( ! projIdent) {
			projIdent = dotfile.getCurrentProject();
			if ( ! projIdent) {
				console.log('There is no current project.'.yellow);
				return;
			}
		}

		client.get(url + "/dbaseschemas?filter=project_ident=" + projIdent, {
			headers: {
				Authorization: "Espresso " + apiKey + ":1"
			}
		}, function(data) {
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			printObject.printHeader('Databases');
			var table = new Table();
			_.each(data, function(p) {
				table.cell("Name", p.name);
				table.cell("Prefix", p.prefix);
				var type = "";
				switch(p.dbasetype_ident) {
					case 1: type = "MySQL"; break;
					case 2: type = "Oracle"; break;
					case 3: type = "SQL Server (jTDS)"; break;
					case 4: type = "SQL Server"; break;
					case 5: type = "SQL Server (Azure)"; break;
					case 6: type = "NuoDB"; break;
					case 7: type = "PostgreSQL"; break;
					default: type = "unknown";
				}
				table.cell("Type", type);
				table.cell("Active", p.active);
				table.cell("Catalog", p.catalog_name);
				table.cell("Schema", p.schema_name);
				table.cell("User", p.user_name);
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
			table.sort(['Active', 'Name']);
			if (data.length === 0) {
				console.log('There is no database defined for this project'.yellow);
			}
			else {
				console.log(table.toString());
			}
			printObject.printHeader("# databases: " + data.length);
		});
	},
	
	create: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		if ( ! cmd.db_name) {
			console.log('Missing parameter: name'.red);
			return;
		}
		if ( ! cmd.prefix) {
			prefix = "main";
		}
		var curProj = cmd.project_ident;
		if ( ! curProj) {
			curProj = dotfile.getCurrentProject();
		}
		if ( ! curProj) {
			console.log('There is no current project.'.yellow);
			return;
		}
		if ( ! cmd.user_name) {
			console.log('Missing parameter: user_name'.red);
			return;
		}
		if ( ! cmd.password) {
			console.log('Missing parameter: password'.red);
			return;
		}
		if ( ! cmd.url) {
			console.log('Missing parameter: url'.red);
			return;
		}
		
		var dbasetype = cmd.dbasetype;
		if ( ! dbasetype) {
			console.log('You must specify a database type.'.red);
			return;
		}
		dbasetype = dbasetype.toLowerCase();
		switch(dbasetype) {
			case "mysql": dbasetype = 1; break;
			case "oracle": dbasetype = 2; break;
			case "sqlserver": dbasetype = 5; break;
			case "sql server": dbasetype = 5; break;
			case "sqlserverazure": dbasetype = 6; break;
			case "sql server azure": dbasetype = 6; break;
			case "nuodb": dbasetype = 7; break;
			case "postgres": dbasetype = 8; break;
			case "postgresql": dbasetype = 8; break;
			default : console.log('Unknown database type: ' + dbasetype); return;
		}

		context.getContext(cmd, function() {
			//console.log('Current account: ' + JSON.stringify(context.account));
			
			var newDbase = {
				name: cmd.db_name,
				prefix: cmd.prefix,
				url: cmd.url,
				catalog_name: cmd.catalog_name,
				schema_name: cmd.schema_name,
				user_name: cmd.user_name,
				password: cmd.password,
				port_num: cmd.port_num,
				active: true,
				comments: cmd.comments,
				dbasetype_ident: dbasetype,
				project_ident: curProj
			};
			var startTime = new Date();
			client.post(loginInfo.url + "/dbaseschemas", {
				data: newDbase,
				headers: {
					Authorization: "Espresso " + loginInfo.apiKey + ":1"
				}
			}, function(data) {
				var endTime = new Date();
				if (data.errorMessage) {
					console.log(data.errorMessage.red);
					return;
				}
				printObject.printHeader('Database connection was created');
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
	
	update: function(cmd) {
		console.log('Sorry, this function is not yet implemented');
	},
	
	del : function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo) {
			console.log('You are not currently logged into any Espresso Logic server.'.red);
			return;
		}

		var filt = null;
		if (cmd.prefix) {
			filt = "prefix='" + cmd.prefix + "'";
		}
		else if (cmd.db_name) {
			filt = "name='" + cmd.db_name + "'";
		}
		else {
			console.log('Missing parameter: please specify either db_name or prefix'.red);
			return;
		}
		
		client.get(loginInfo.url + "/dbaseschemas?filter=" + filt, {
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
				console.log(("Error: no such database").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one database for the given condition: " + filter).red);
				return;
			}
			var db = data[0];
			var startTime = new Date();
			client['delete'](db['@metadata'].href + "?checksum=" + db['@metadata'].checksum, {
				headers: {
					Authorization: "Espresso " + loginInfo.apiKey + ":1"
				}
			}, function(data2) {
				var endTime = new Date();
				if (data2.errorMessage) {
					console.log(data2.errorMessage.red);
					return;
				}
				printObject.printHeader('Database connection was deleted, including the following objects:');
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
	}
};
