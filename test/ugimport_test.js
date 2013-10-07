'use strict';

var ugimport = require('../lib/ugimport.js');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports['public API'] = {
  'has "login" function': function(test) {
	  test.equals(typeof ugimport.login, 'function');
	  test.done();
  },
  'has "importCsv" function': function(test) {
	  test.equals(typeof ugimport.importCsv, 'function');
	  test.done();
  }
};
