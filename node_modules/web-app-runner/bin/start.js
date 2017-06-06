#!/usr/bin/env node

var conf = require( __dirname + '/conf' );

require('../lib/WebAppRunner').createInstance( { configFile:conf } );
