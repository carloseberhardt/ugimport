This is ugimport
=================
Why?
----
Why Pinto?
Why not?

How?
----
Node.js...

What?
----
simple module to import data to Usergrid

When?
----
Whenever...

Usage
----
	node ./bin/ugimport.js [options] <file/stdin>

	Options:
	  -o, --org         App Services Organization.            [required]
	  -a, --app         Application within Organization.      [required]
	  -c, --collection  Collection for import.                [required]
	  -u, --user        App Services admin username (email).  [required]
	  -p, --password    admin password                        [required]
	  -h, --host        Host URI for App Services API.        [default: "https://api.usergrid.com"]
	  -s, --separator   Field separator character.            [default: ","]
	  -q, --quote       Quote character.                      [default: "\""]
	  -m, --comment     Comment character.                    [default: "#"]