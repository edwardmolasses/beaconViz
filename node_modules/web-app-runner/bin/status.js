#!/usr/bin/env node

'use strict';

var conf = require( __dirname + '/conf' ),
    opts = conf.readConfig(),
    exec = require( 'child_process' ).exec,
    command = [ 'curl -d token=', opts.appkey, ' -X GET', ' http://127.0.0.1:', opts.port, '/status' ].join(''),
    child;

child = exec(command, function(err, stdout, stderr) {
    if (err) {
        console.log( 'error: ', err);
    } else {
        console.log( JSON.parse( stdout, true, 2 ) );
    }
});
