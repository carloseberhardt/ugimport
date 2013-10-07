#! /usr/bin/env node

// command line wrapper for ugimport
// ideally this would be a nice unixy tool...
// read from file or stdin

fs = require('fs');
util = require('util');
ugimport = require("../lib/ugimport.js");
var argv = require('optimist')
  .usage("Import a csv file into a usergrid collection.\nUsage: $0 [options] <file/stdin>")
  .demand(['o','a','c','u','p'])
  .alias({'o':'org'
  	,'a':'app'
	,'c':'collection'
	,'u':'user'
	,'p':'password'
	,'h':'host'
	,'s':'separator'
	,'q':'quote'
	,'m':'comment'
  })
  .describe({'o':'App Services Organization.'
    ,'a':'Application within Organization.'
	,'c':'Collection for import.'
	,'u':'App Services admin username (email).'
	,'p':'admin password'
    ,'h':'Host URI for App Services API.'
	,'s':'Field separator character.'
	,'q':'Quote character.'
	,'m':'Comment character.'
  })
  .default({'h':'https://api.usergrid.com','s':',','q':'"','m':'#'})
  .argv
;

//options.separator, quote: options.quote, comment: options.comment

if (argv._[0]) {
	// filename passed in
	console.log ('got filename');
	argv.stream = fs.createReadStream(argv._[0],{'encoding':'UTF-8'});
} else {
	// stdin
	console.log ('stdin');
	process.stdin.setEncoding('utf8');
	argv.stream = process.stdin;
}

doImport(argv);


function doImport(options) {
	console.log("org: %s, app: %s, collection: %s", options.org, options.app, options.collection);
	ugimport.importCsv(options, function (err, data) {
		if (err) {
			// do something scary
			console.log('crapperino!');
		} else {
			console.log(JSON.stringify(data));
		}
	});
}