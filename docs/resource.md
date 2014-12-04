# Resource

This suite of commands allows you to manipulate the resources in your projects.

***
## Resource list
    espressoadmin resource list

The `list` command shows all resources for the current project.

#### Output
	Top-level resources
	Name                             Prefix  Table          Type        Comments
	-------------------------------  ------  -------------  ----------  --------------------------------------------------
	AllCustomers                     demo    customer       normal      Query for all customers
	CustomerBusinessObject           demo    customer       normal      all customer attributes and related child data
	Customers                        demo    customer       normal      API example - illustrates attribute aliasing / ...
	Products                         demo    product        normal      Query for all products
	PurchaseOrders                   demo    PurchaseOrder  normal      Query for all orders with line items
	
	# resources: 5

***
## Resource create
    espressoadmin resource create --resource_name <name> --table_name <table-name>
    	[--prefix <table-prefix>] [--type <type>] [--is_collection <true|false>]
    	[--description <text>] [--container_ident <ident>] [--apiversion <apiversion>]

The `create` command creates a new resource in the current project.

The `prefix` parameter is optional if you only have one database in your current project.

The `type` parameter is `normal` if unspecified, otherwise it must be one of:

* `normal`
* `sql`
* `javascript`
* `storedproc`
* `mongo`

If creating a subresource, the `container_ident` parameter must be the `ident` of another resource.

If there is more than one API version in the current project, you must specify one with the `apiversion`
parameter.

***
## Resource delete
    espressoadmin resource delete --resource_name <name>

The `delete` command deletes the specified resource.


