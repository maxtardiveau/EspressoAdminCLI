# Project

This suite of commands allows you to manipulate your Espresso Logic projects.

***
## Project list
    espressoadmin project list

The `list` command shows all projects in the current server.

#### Output
    All projects
    Ident  Name                   URL      Comments
    -----  ---------------------  -------  --------
    1000   Espresso Logic Demo    demo
    1002   Espresso Logic Sample  sample
    1003   My Project             myproj
    1005   My Project2            myproj2
    1001   Your Database          data
    
    # projects: 5


***
## Project create

    espressoadmin project create --project_name <name> --url_name <url_name> [--status <A|I>] 
        [--comments <comments>] [--verbose]

The create command creates a new project with the given values. Status is active by default, it can be specified
as A(ctive) or I(nactive).

If the `--verbose` option is specified, the output will include all created objects instead of a summary.

### Output

	Project was created, including:
	I admin:projects/1007 ident:1007 ts:2014-11-26T14:21:... name:My Project3 url_name:myproj3 comments:[null] status:A is_active:true account_ident:1000 authprovider_ident:[null]
	and 20 other objects
	Request took: 470ms - # objects touched: 21
	Current project is now: My Project3 (1007)

Note that creating a project also creates a number of other default objects.
Once the project is created, it becomes the current project.

***
## Project update

    espressoadmin project update [--project_name <name> | --url_name <url_name>] 
        [--status <A-I>] [--comments <comments>]

The update command updates one or more attribute of the specified project.
The project can be specified either by its name or by its URL name.

***
## Project delete

    espressoadmin project delete [--project_name <name> | --url_name <url_name>] [--verbose]

The delete command deletes the specified project and everything it contains.
The project can be specified either by its name or by its URL name.

If the `--verbose` option is specified, the output will include all deleted objects instead of a summary.

***
## Project use

    espressoadmin project use [--project_name <name> | --url_name <url_name>]

The use command makes the specified project the current project.
The project can be specified either by its name or by its URL name.

***
## Project import

    espressoadmin project import [--file <filename>] [--project_name <name> | --url_name <url_name>]
         [--verbose]

The import command imports a project from the specified JSON export file.
If the `filename` parameter is not specified, stdin is used. This allows you
to pipe in content from another command.

You can optionally give the new project a different name or URL name.

If the `--verbose` option is specified, the output will include all created objects instead of a summary.

***
## Project export

    espressoadmin project export --file <filename> [--project_name <name> | --url_name <url_name>]
         [--verbose]
    
The export project exports the specified project into a JSON file.
If the `filename` parameter is not specified, stdout is used.

The project can be specified either by its name or by its URL name.

If the `--verbose` option is specified, the output will include all created objects instead of a summary.
