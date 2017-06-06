#!/usr/bin/env node

var runner = require('../lib/DaemonRunner').createDaemonRunner(),
    command = __dirname + '/TestJob.js',
    child = runner.start( command, [ 'foo', 'bar' ] );

console.log( child );
console.log('child job running with pid: ', child.pid );
console.log('child log file is in ', __dirname + '/job.log' );
console.log('the child should run for about 10 seconds then quit...');

runner.stop();
