/**
 * @class DaemonRunner
 *
 * @author: darryl.west@roundpeg.com
 * @created: 7/24/14 9:14 AM
 */
var dash = require('lodash' ),
    fs = require('fs');

var DaemonRunner = function(options) {
    'use strict';

    var runner = this,
        log = options.log,
        spawn = options.spawn || require( 'child_process' ).spawn,
        stdio = options.stdio || [ 'ignore', 'ignore', 'ignore' ],
        cwd = options.pwd || process.cwd,
        detach = dash.isBoolean( options.detach ) ? options.detach : true;

    /**
     * Start the background process.  command must be the full path to the executable.  if it's a node
     * script it must be self-executing (#!/usr/bin/env node) or include the full path to the node binary.
     *
     * The background process will run in the background and if detached is true (the default), the parent
     * process (this) may exit without affecting the child.
     *
     * @param command - full path to the executable
     * @param args - optional arguments
     * @param opts - optional options for stdio, pwd, env, detached etc
     * @returns child
     */
    this.start = function(command, args, spawnOptions) {
        var opts,
            child;

        if (!runner.verifyCommandFile( command )) {
            log.error('command is not found: ', command);
            return null;
        }

        if (!spawnOptions) {
            opts = {};
        } else {
            opts = dash.clone( spawnOptions );
        }

        if (!args) {
            args = [];
        }

        log.info('start the script: ', command, ', args: ', args);

        if (!opts.cwd) {
            opts.cwd = cwd;
        }

        if (!opts.stdio) {
            opts.stdio = stdio;
        }

        if (!opts.env) {
            opts.env = process.env;
        }

        if (!opts.detached) {
            opts.detached = detach;
        }

        log.debug('opts: ', opts );

        child = spawn( command, args, opts );

        if (opts.detached) {
            log.info('un-reference the child for pid: ', child.pid);
            child.unref();
        }

        return child;
    };

    /**
     * verify the executable file
     *
     * @param file - full path to the executable
     * @returns true if the file exists
     */
    this.verifyCommandFile = function(file) {
        var exists = fs.existsSync( file );
        log.debug( 'file: ', file, ' exists? ', exists);

        return exists;
    };

    /**
     * kill the process
     * 
     * @param pid
     */
    this.stop = function(pid) {
        if (!pid) {
            log.debug('kill myself...');
            pid = process.pid;
        }
        log.info('kill the process: ', pid);


        setTimeout(function() {
            process.kill( pid );
        }, 100);
    };

    this.__protected = function() {
        return {
            stdio:stdio,
            cwd:cwd
        };
    };

    // constructor validations
    if (!log) throw new Error('socket server must be constructed with a log');
};

DaemonRunner.createDaemonRunner = function(opts) {
    'use strict';

    if (!opts) {
        opts = {};
    }

    if (!opts.log) {
        opts.log = require('simple-node-logger' ).createSimpleLogger();
    }

    return new DaemonRunner( opts );
};

module.exports = DaemonRunner;
