# Web App Runner
- - -

A simple HTTP server targeted for single-page web applications.

[![NPM version](https://badge.fury.io/js/web-app-runner.svg)](http://badge.fury.io/js/web-app-runner)
[![Build Status](https://travis-ci.org/darrylwest/web-app-runner.svg?branch=master)](https://travis-ci.org/darrylwest/web-app-runner)
[![Dependency Status](https://david-dm.org/darrylwest/web-app-runner.svg)](https://david-dm.org/darrylwest/web-app-runner)

## Overview

Simple HTTP server that implements middleware for banning or re-routing authorized connections based on ip, agent or other request attributes. The server can be used stand alone or as middleware for connect or express.  Static content is scanned for gzip files and will deliver compressed files if they exist.

_NOTE: this server is designed to deliver simple HTML applications that connect to alternate services.  It has a bit more features when compared with http-server, but isn't intended to be a full REST-type back-end._

## Installation

	npm install web-app-runner --save

## Use

There are various levels of authentication that can be applied ranging from completely open to finely filtered.  The very basic server can be launched in a few lines of code while more robust applications include loggers, accept/reject list files, configuration files, etc. 

### Minimal Web Server

A minimal server running on port 3000 from a root public folder that has index.html:

    // by default the server returns public/index.html
	require('web-app-runner').createInstance().start();
	
It's easy to stop this server--just hit ctrl-c.

### Basic Server

Adding options and middleware gives you a bit more flexibility:

	var opts = {},
		runner;
	
	opts.port = 3002;
	opts.env = 'staging';
	opts.home = './';
	
	runner = require('web-app-runner').createInstance( opts );
	runner.createApp().use( someMiddleWare() );
	
	runner.start();	
    
### Production Web Server

#### Static Configuration Example

This example shows a more realistic environment where the environment is set to production, configuration is set int the run script and the server runs in a background daemon.

	// IP & agent accept/reject lists defined in config
	var configFile = __dirname + '/config.js',
    	logfile = process.env.HOME + '/logs/web-app.log',
    	log = require('simple-node-logger').createRollingFileLogger( logfile ),
    	opts = { 
        	log:log,
        	env:'production',
        	port:18004,
        	home:'./public',
        	daemon:true,
        	clustered:true
    	},
    	favicon = require('serve-favicon'),
    	connect = require('connect'),  
    	runner = require('web-app-runner').createInstance( opts ),
    	app = runner.createApp();
    
    // use additional middleware
    app.use( favicon( home + /favicon.png ) );
    
	runner.start();

The advantage to this approach is that it exposes the connect 'app', allowing you to use additional middleware.  The disadvantage is that the script is static, so can't be re-read while the service is running.

You can stop this server from the local host by doing this:

	curl -d token=<appkey> http://127.0.0.1:<port>/shutdown
	
Where appkey is defined in options and the port is the current listening port.  Alternatively, you can find the PID by looking in the logs and send a kill signal (-2 or -9).  There is also a convenient script in the bin folder that will stop a service, daemon or not as long as it's run from the origin server like this:

	./bin/stop.js
	
#### Dynamic Configuration Example

This example separates configuration into a re-readable configuration file.

	require('web-app-runner').createInstance( { configFile: __dirname + '/conf.js' } );
	
The advantage to this approach is that running a server is a one-liner.  So, to run two or three servers is as easy as this:

	var conf = __dirname + '/conf.js',
		ports = [ 3001, 3002, 3003 ];
	
	keys.forEach(function(port) {
		require('web-app-runner').createInstance( { configFile:conf, port:port } );
	});
	
Each server has its own process id and can be started/stopped independent of the other servers.

The configuration file, conf.js should implement 'readConfig' and 'readFilters'.  It might look something like this:


	module.exports.readConfig = function() {
    	var config = {
        	env:'staging',
        	port:3005,
        	daemon:true,
        	logFile:process.env.HOME + '/logs/staging-3005.log',
        	logLevel:'warn'
    	};

    	return config;
	};

	module.exports.readFilters = function() {
    	var filters = {};

    	filters.ip = {
        	accept:[ ],
        	reject:[ ]
    	};

    	filters.agent = {
        	accept:[ ],
        	reject:[ ]
    	};

    	return filters;
	};

### IP Filter

The following IP Filter server with accept and reject specific IP addresses.  All unknown IPs are accepted.  This is modified with the __acceptUnknownVisitor__ option parameter set to false.

IP filters work on lists of regular expressions for accepting and rejecting specific addresses or address ranges.  The process first checks the accept list and allows access if there is a match.  If the accept list is not matched, then the reject list is checked.  When a reject list match is detected the user is sent to the specified reject URL.

The process first checks the accept list, then the reject list.

	var opts = {
			ip:{
				accept:[
					/^127\.0\.0\.1/,
					/^173\.13\.151\.1/
				],
				reject:[
					/^193\.144\.151\.1/,
					/^193\.144\.151\.2/
				],
				acceptUnkownVisitor:true
			}
		},
		runner = require('web-app-runner').createInstance( opts );
		
	runner.start();
	
Or better yet, define the accept and reject lists in the config file and set the refresh rate.  This way, the lists are refreshed when they change.

### Agent Filter

Agent filters work on lists of regular expressions.  The process first checks the accept list and allows access if there is a match.  If the accept list is not matched, then the reject list is checked.  When a reject list match is detected the user is sent to the specified reject URL.  

	var opts = {
			agent:{
				accept:[
					/chrome/[23][0-9]/,
					/msie 1[0-1]/,
					/safari/[7-8]/,
					/safari/534/
				],
				reject:[
					/msie [2-9]/,
					/safari/[2-5]/
					/chrome/2[0-6]/
					/chrome/1[0-9]/
				],
				acceptUnkownAgent:true,
				rejectURL:'/browser-not-supported.html'
			}
		},
		runner = require('web-app-runner').createInstance( opts );
		
	runner.start();

## Tests

Tests are in place for all implemented methods. Tests are written in mocha/chai/should and include jshint rules.  To run the tests, do this:

	make test
	
	// or 
	
	make watch
	
	// or
	
	make jshint
	
## Examples

There are a number of simple and not so simple examples in the examples folder that demonstrate how to run in development and production mode.  The examples include:

* minimal-server.js - just the bare minimum to run a development server
* basic-server.js - a bit more control over a specific environment; demonstrates gzip capabilities
* ipfilter-server.js - demonstrates ip filtering
* daemon-server.js - a background server done the hard way (see bin/start.js for the easy way)
* start-page.js - a pre-loaded start page with redirect 

There is also a more realistic production runner in the bin folder called bin/ that includes conf.js, start.js, status.js and stop.js scripts.

- - -
<p><small><em>Copyright © 2014-2016, rain city software | Version 0.91.10</em></small></p>
