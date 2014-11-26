

# EspressoAdminCLI

## Description

This is a command-line tool to administer Espresso Logic servers. It allows the creation,
modification and deletion of many common objects, such as projects, database connection,
resources and rules.

## Installation

    npm install espresso-admin-cli

Please note that, on Windows (and sometimes Mac), `npm install` will create an executable 
called `espressoadmin` in your
`<node_modules>/.bin` directory. If this directory is not in your `PATH`, you will probably
want to fix that, otherwise you'll have to specify the full path to the executable.

***
## Login

    espressoadmin login <url> -u <user-name> -p <password> [-a <alias>]

### Parameters

The URL will normally be the address of the server, such as:

    https://eval.espressologic.com
    http://api.acme.com

If you specify an alias, then you will be able to refer to that connection using that alias.
This is useful if you plan to work with several servers at the same time.

Regardless, this command sets your *current server* -- see [the use command](/use/) below.

### Example
    $ espressoadmin login https://api.acme.com -u fred -p secret
    Logging in...
    This server licensed to: Acme Inc.
    Login successful, API key will expire on: 2014-11-27T03:36:55.266Z

***
## Logout

    espressoadmin logout [-a <alias>]

This will log you out of the current server, unless you specify an alias,
in which case you will be logged out of that server.

***
## Use

    espressoadmin use <alias>

This switches the current server to the specified alias.

***
## Status

    espressoadmin status
    
Prints which server is the current server (if any) and project, and what aliases are defined (if any).

### Output

    Defined aliases:
    ┌───────┬───────────────────────────────────────────────────────┬───────┐
    │ Alias │ Server                                                │ User  │
    ├───────┼───────────────────────────────────────────────────────┼───────┤
    │ api   │ http://api.acme.com/rest/abl/admin/v2                 │ admin │
    └───────┴───────────────────────────────────────────────────────┴───────┘
    You are currently logged in to admin server: http://acme.my.espressologic.com/rest/abl/admin/v2 as user acme
    Current project is: Acme Sales [1234] - url_name: sales

***
## Object-specific commands

* [Projects](./project.md/)
