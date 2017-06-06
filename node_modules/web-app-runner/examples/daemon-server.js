#!/usr/bin/env node

// example of how to create a daemon server without setting the daemon flag
var dash = require( 'lodash' ),
    childKey = '--run-child-service',
    args = dash.toArray( process.argv ),
    runner,
    child,
    command,
    opts = {
        port:3002,
        logfile: __dirname + '/daemon-server.log',
        env:'staging',
        daemon:false
    };

// remove the 'node' param
args.shift();

console.log( args );

if (args[ 1 ] === childKey ) {
    // this was called by the background service, so run as a child
    console.log( 'run the web app, pid: ', process.pid );
    runner = require( '../lib/WebAppRunner' ).createInstance( opts );
    runner.start();
} else {
    // pull the original script name
    command = args.shift();

    // push our child key to the front of the args list, while preserving any other args
    args.unshift( childKey );

    runner = require('background-service-runner' ).createDaemonRunner();
    child = runner.start( command, args );

    console.log('child pid: ', child.pid );
}

