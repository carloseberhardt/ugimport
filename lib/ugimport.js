/*
 * ugimport
 * https://github.com/carloseberhardt/ugimport
 *
 * Copyright (c) 2013 Carlos Eberhardt
 * Licensed under the MIT license.
 */

//
// TODO: refactor this to use EventEmitter ??
//

'use strict';

var usergrid = require('usergrid');
var csv = require('ya-csv');
var util = require('util');

exports.importCsv = function (options, callback) {
	login(options, function(err, result) {
		if (err) {
			callback(true, result);
		} else {
			options.client = result;
			parseCsv(options, function(err, result) {
				if (err) {
					callback(true, "Error parsing file.");
				} else {
					importCsv(options, result, function(err, result) {
						callback(false, result);
					});
				}
			});
		}
	});
};

function parseCsv(options, callback) {
	var reader = csv.createCsvStreamReader({separator: options.separator, quote: options.quote, comment: options.comment, columnsFromHeader: true });
	var rows = [];
	
	reader.addListener('end', function() {
		// util.debug('end parse.');
		callback(false, rows);
	});
	reader.addListener('error', function(e) {
		// TODO: Need to handle parsing errors
		util.debug('error: ', e);
	});
	reader.addListener('data', function(data) {
		// util.debug("reader data.");
		rows.push(data);
	});
	
	options.stream.on('data', function(data) {
		// util.debug("stream data.");
		reader.parse(data);
	});
	options.stream.on('end', function() {
		reader.end();
	});
}

function importCsv(options, data, callback) {
	var fails = [];
	var wins = [];
	var running = 0;
	var limit = 2;
	// util.debug("length: "+data.length);

	function final() { 	callback(false, {wins:wins, fails:fails}); }
	function runner() {
		while(running < limit && data.length > 0) {
			// util.debug("running "+running+" limit "+limit);
			var i = data.shift();
			importRow(options, i, function(err, result) {
				// util.debug("result " + JSON.stringify(result));
				if (err) {
					fails.push(result);
					running--;
				} else {
					wins.push(result);
					running--;
				}
				if (data.length > 0) {
					runner();
				} else if (running == 0) {
					final();
				}
			});
			running++;
		}
	}
	runner();
}

function importRow(options, row, callback) {
	var opts = {
		method: "POST"
		,endpoint: options.collection
		,qs : {access_token: options.client.getToken()}
		,body: row
	}
	options.client.request(opts, function (err, entity) {
		if (err) {
			// row failed to import
			callback(true, entity);
		} else {
			callback(false, entity);
		}
	});
}

function login (options, callback) {
	var client = new usergrid.client({
		// logging: true
	});
	
	var ugoptions = {
		mQuery: true,
		method: "POST",
		endpoint: "management/token",
		body: {
			username: options.user,
			password: options.password,
			grant_type: "password"
		}
	}
	
	client.request(ugoptions, function(err, data) {
		if (err) {
			callback(true, data);
		} else {
			client.setToken(data.access_token);
			client.orgName = options.org;
			client.appName = options.app;
			callback(false, client);
		}
	});
	
}