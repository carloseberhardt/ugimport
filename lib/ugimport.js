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
var reservedWords =[ 'uuid', 'created', 'modified'];

exports.importCsv = function (options, callback) {
    login(options, function (err, result) {
        if (err) {
            callback(err, result);
        } else {
            options.client = result;
            parseCsv(options, function (err, result) {
                if (err) {
                    callback(err, "Error parsing file. " + result);
                } else {
                    importCsv(options, result, function (err, result) {
                        callback(false, result);
                    });
                }
            });
        }
    });
};

function parseCsv(options, callback) {
    var reader = csv.createCsvStreamReader({
        separator: options.separator,
        quote: options.quote,
        comment: options.comment,
        columnsFromHeader: true
    });
    
    var rows =[];
    
    reader.addListener('end', function () {
        callback(false, rows);
    });
    reader.addListener('error', function (e) {
        // TODO: Need to handle parsing errors
        util.debug('error: ', e);
    });
    reader.addListener('data', function (data) {
        rows.push(data);
    });
    
    options.stream.on('data', function (data) {
        
        // Check to see if there are any property names in the header, whose
        // values translate to prop names.
        var headerArray = data.match(/.*\n/)[0].trim().split(options.separator);
        validatePropertyNames(options, headerArray, function (invalidHeaders) {
            if (invalidHeaders.length > 0) {
                callback(true, "Headers can't be reserved words: " + "'" +
                invalidHeaders.join(", ") + "'" + "\n" +
                "Reserved words include: " + reservedWords.join(", "));
            } else {
                rows.push(data);
                reader.parse(data);
            }
        });
    });
    
    options.stream.on('end', function () {
        reader.end();
    });
}

function validatePropertyNames(options, headerArray, callback) {
    var invalidHeaders =[];
    reservedWords.forEach(function (element, index, reservedWords) {
        if (headerArray.indexOf(element) >= 0) {
            invalidHeaders.push(element);
        }
    });
    callback(invalidHeaders);
}

function importCsv(options, data, callback) {
    var fails =[];
    var wins =[];
    var running = 0;
    var limit = 10;
    // var entityArray = [];
    
    function final () {
        callback(false, {
            wins: wins, fails: fails
        });
    }
    
    function runner() {
        while (running < limit && data.length > 0) {
            var i = data.shift();
            
            // entityArray.push(i);
            
            importRow(options, i, function (err, result) {
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
                    final ();
                }
            });
            running++;
        }
    }
    runner();
}

function importRow(options, row, callback) {
    var opts = {
        method: "POST", endpoint: options.collection, qs: {
            access_token: options.client.getToken()
        },
        body: row
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
    
    client.request(ugoptions, function (err, data) {
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