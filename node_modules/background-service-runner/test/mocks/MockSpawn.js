/**
 *
 *
 * @author: darryl.west@roundpeg.com
 * @created: 7/24/14 4:46 PM
 */
var dash = require('lodash' ),
    MockChild = require('./MockChild');

var MockSpawn = function() {
    'use strict';

    var command,
        args,
        spawnOptions;

    this.spawn = function(cmd, cmdArgs, spawnOpts) {
        command = cmd;
        args = cmdArgs;

        if (spawnOpts) {
            spawnOptions = dash.clone( spawnOpts );
        }

        var child = new MockChild( spawnOptions );

        return child;
    };

    this.getCommand = function() {
        return command;
    };

    this.getArgs = function() {
        return args;
    };

    this.getSpawnOptions = function() {
        return spawnOptions;
    };
};

module.exports = MockSpawn;