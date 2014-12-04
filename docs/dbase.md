# Database

This suite of commands allows you to manipulate the database connection(s) in your projects.

***
## Database list
    espressoadmin database list

The `list` command shows all database connections for the current project.

#### Output
    Databases
    Name                 Prefix  Type   Active  Catalog       Schema  User          Comments
    -------------------  ------  -----  ------  ------------  ------  ------------  --------
    Espresso Logic Demo  demo    MySQL  true    dblocal_demo  null    dblocal_demo
    
    # databases: 1

***
## Database create
    espressoadmin database create --name <name> --user_name <db-user-name> --password <db-password>
    	--url <db-url> --dbasetype <type>
    	[--prefix <prefix>] [--catalog_name <catalog>] [--schema_name <schema>] [--port_num <port>]
    	[--comments <comments>]

The `create` command creates a new connection to a database.

The `url` parameter should be a valid JDBC URL, such as:

    jdbc:mysql://dbserver.acme.com:3306/mydb
    jdbc:sqlserver://db1.foo.org:1436/northwind

The `type` parameter must have one of the following values:

* `mysql`
* `sqlserver`
* `oracle`
* `sqlserverazure` (for Azure SQL)
* `nuodb`
* `postgres`

If the `prefix` parameter is not specified, it will default to "main".

***
## Database delete
    espressoadmin database delete [--db_name <name> | --prefix <prefix>]

The `delete` command deletes a database connection from the current project.
Either the name of the database connection, or its prefix, must be specified.

