/**
 * @class MockDaemonRunner
 *
 * @author: darryl.west@roundpeg.com
 * @created: 7/26/14 8:48 AM
 */
var DaemonRunner = require( '../../lib/DaemonRunner' ),
    MockSpawn = require( './MockSpawn' ),
    MockChild = require( './MockChild' );

var MockDaemonRunner = function() {
    'use strict';

    this.start = function(command, args, opts) {
        return new MockChild();
    };
};

MockDaemonRunner.createDaemonRunner = function(opts) {
    'use strict';

    if (!opts) {
        opts = {};
    }

    if (!opts.log) {
        opts.log = require('simple-node-logger' ).createSimpleLogger();
        opts.log.setLevel('fatal');
    }

    opts.spawn = new MockSpawn().spawn;

    var runner = new DaemonRunner( opts );

    runner.verifyCommandFile = function(command) {
        if (command) {
            return true;
        } else {
            return false;
        }
    };

    runner.stop = function(pid) {
        
    };

    return runner;
};

module.exports = MockDaemonRunner;
