#!/usr/bin/env node 

var TestJob = function(options) {
    'use strict';

    var job = this,
        log = options.log;

    this.start = function() {
        log.info('job started: ', new Date(), ', pid: ', process.pid);
        var loops = 10,
            id;

        id = setInterval(function() {
            log.info('current loop: ', loops);

            loops--;

            if (loops <= 0) {
                log.info('job done...');
                clearInterval( id );
                return;
            }
        }, 1000);
    };
};

var log = require('simple-node-logger').createSimpleFileLogger( __dirname + '/job.log' ),
    opts = { log:log },
    job = new TestJob( opts );

log.info('args: ', process.argv);

job.start();

