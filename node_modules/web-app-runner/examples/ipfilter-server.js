#!/usr/bin/env node

var opts = {
        port:3001,
        ip:{
            whiteList:[
                '10.1.10.10'
            ],
            blackList:[
                '127.9.9.9',
                '10.1.10.144'
            ],
            acceptUnknownVisitor:true
        }
    },
    runner = require( '../lib/WebAppRunner' ).createInstance( opts );

runner.start();

