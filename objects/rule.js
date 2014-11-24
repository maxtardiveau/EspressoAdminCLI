var Client = require('node-rest-client').Client;
var colors = require('colors');
var _ = require('underscore');
var Table = require('easy-table');

var context = require('./context.js');
var login = require('../util/login.js');
var printObject = require('../util/printObject.js');
var dotfile = require('../util/dotfile.js');

module.exports = {
	doRule: function(action, cmd) {
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

		client.get(url + "/rules?filter=project_ident=" + projIdent, {
			headers: {
				Authorization: "Espresso " + apiKey + ":1"
			}
		}, function(data) {
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			printObject.printHeader('Rules');
			var table = new Table();
			var tblWidth = 0;
			var typeWidth = 0;
			_.each(data, function(p) {
				table.cell("Table", p.entity_name);
				tblWidth = p.entity_name.length > tblWidth ? p.entity_name.length : tblWidth;
				var type = "";
				switch(p.ruletype_ident) {
					case 1: type = "sum"; break;
					case 2: type = "count"; break;
					case 3: type = "formula"; break;
					case 4: type = "parent copy"; break;
					case 5: type = "validation"; break;
					case 6: type = "commit validation"; break;
					case 7: type = "event"; break;
					case 8: type = "early event"; break;
					case 9: type = "commit event"; break;
					case 11: type = "minimum"; break;
					case 12: type = "maximum"; break;
					case 13: type = "managed parent"; break;
					default: type = "unknown";
				}
				typeWidth = type.length > typeWidth ? type.length : typeWidth;
				
				var maxWidth = printObject.getScreenWidth() - (tblWidth + typeWidth + 4+ 2);
				var maxColWidth = (maxWidth / 2) - 3;
				
				table.cell("Type", type);
				var autoName = p.auto_name;
				if (autoName.length > maxColWidth) {
					autoName = autoName.substring(0, (maxColWidth - 3)) + "...";
				}
				table.cell("Description", autoName.replace(/\n/g, ''));
				var comments = p.comments;
				if (comments) {
					comments = comments.replace(/\n/g, '');
				}
				if ( ! comments) {
					comments = "";
				}
				else if (comments.length > maxColWidth){
					comments = comments.substring(0, (maxColWidth - 3)) + "...";
				}
				table.cell("Comments", comments);
				table.newRow();
			});
			if (data.length === 0) {
				console.log('There is no rule defined for this project'.yellow);
			}
			else {
				table.sort(['Table', 'Type', 'Description']);
				console.log(table.toString());
			}
			printObject.printHeader("# rules: " + data.length);
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
				name: cmd.name,
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
		else if (cmd.name) {
			filt = "name='" + cmd.name + "'";
		}
		else {
			console.log('Missing parameter: please specify either name or prefix'.red);
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
