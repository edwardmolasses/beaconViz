#!/usr/bin/env node

'use strict';

var conf = require( __dirname + '/conf' ),
    opts = conf.readConfig(),
    exec = require( 'child_process' ).exec,
    command = [ 'curl -d token=', opts.appkey, ' http://127.0.0.1:', opts.port, '/shutdown' ].join(''),
    child;

child = exec(command, function(err, stdout, stderr) {
    console.log( stdout );

    if (err) {
        console.log( 'error: ', err);
    }
    
    if (stderr) {
        console.log( stderr );
    }
});
