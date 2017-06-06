#!/usr/bin/env node

var opts = {
        port:3001
    },
    runner = require( '../lib/WebAppRunner' ).createInstance( opts );

runner.start();

