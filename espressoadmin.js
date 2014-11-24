#!/usr/bin/env node

/**
 * A command-line interface for Espresso Logic administration
 */

var program = require('commander');
var path = require('path');
var pkg = require( path.join(__dirname, 'package.json') );

var login = require('./objects/login.js');
var project = require('./objects/project.js');
var dbase = require('./objects/dbase.js');
var resource = require('./objects/resource.js');
var rule = require('./objects/rule.js');
var dotfile = require('./util/dotfile.js');

program
	.version(pkg.version);

program
	.command('login <url>')
	.description('Login to an Espresso Logic server')
	.option('-u, --username <username>', 'Espresso user name under which to log in')
	.option('-p, --password <password>', 'Espresso password')
	.option('-a, --serverAlias <serverAlias>', 'Alias for this connection')
	.action(login.commandLogin);

program
	.command('logout [url]')
	.description('Logout from the current server, or a specific server')
	.option('-a, --serverAlias <serverAlias>', 'Alias from which to logout')
	.action(login.commandLogout);

program
	.command('use <alias>')
	.description('Use the specified server by default')
	.action(login.commandUseAlias);

program
	.command('status')
	.description('Show the current server, and any defined server aliases')
	.action(login.commandStatus);

program
	.command('project <list|create|update|delete|use|import|export>')
	.description('Administer projects. Actions are: list, create, update, delete, use, export')
	.option('--name [name]', 'The name of the project')
	.option('--url_name [url_name]', 'The name of the project')
	.option('--status [status]', 'The status of the project, can be A (for Active) or I for (Inactive)')
	.option('--comments [comments]', 'A description of the project')
	.option('--file [file]', 'For import/export, the name of a file to read from/save to, or - for stdin/stdout')
	.option('--verbose', 'Whether to display detailed results, or just a summary')
	.action(project.doProject);

program
	.command('database <list|create|update|delete>')
	.description('Administer databases within a project.')
	.option('--name [name]', 'The name of the database connection')
	.option('--prefix [prefix]', 'The prefix of the database connection')
	.option('--dbasetype [dbasetype]', 'The type of the database connection, can be mysql, oracle, sqlserver, nuodb, postgres')
	.option('--catalog_name [catalog_name]', 'The catalog in the database')
	.option('--schema_name [schema_name]', 'The schema in the database')
	.option('--user_name [user_name]', 'The name of the database user')
	.option('--password [password]', 'The password of the database user')
	.option('--url [url]', 'The JDBC URL for the database')
	.option('--project_ident', 'The ident of a project, if other than the current project')
	.action(dbase.doDbase);

program
	.command('resource <list>')
	.description('Administer resources within a project.')
	.option('--name [name]', 'The name of the resource')
	.option('--type [type]', 'The type of the resource: normal, sql, javascript, storedproc, mongo')
	.option('--prefix [prefix]', 'The prefix of the table')
	.option('--table_name [name]', 'The name of the table')
	.option('--description [description]', 'A description of the resource')
	.option('--is_collection [true|false]', 'Whether the resource is for a single value or more than one')
	.option('--join_condition [join]', 'How to join this resource to its parent resource')
	.option('--container_ident [ident]', 'The ident of the parent resource, if any')
	.option('--attributes [attributes]', 'The columns t oadd to the resource, in the form {colname: alias, colname:alias}, all if not specified')
	.option('--apiversion [apiversion]', 'The name of an API version, if there is more than one')
	.option('--project_ident', 'The ident of a project, if other than the current project')
	.action(resource.doResource);

program
	.command('rule <list>')
	.description('Administer rules within a project.')
	.option('--apiversion [apiversion]', 'The name of an API version, if there is more than one')
	.option('--project_ident', 'The ident of a project, if other than the current project')
	.action(rule.doRule);

program.parse(process.argv);

if (process.argv.length < 3) {
	console.log('You must specify a command'.red);
	program.help();
}