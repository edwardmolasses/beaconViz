#!/usr/bin/env node

// redirect to an alternate page or pre-load a page on server start-up

var opts = {
        port:3001,
        startPage:'<!DOCTYPE html><html><head><title>Start Up</title><meta HTTP-EQUIV="Refresh" content="2;url=/landing.html"></head><body><p>loading, please wait...</p></body></html>\n'
    },
    runner = require( '../lib/WebAppRunner' ).createInstance( opts );

runner.start();

