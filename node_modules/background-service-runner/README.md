# Background Service Runner
- - -

[![NPM version](https://badge.fury.io/js/background-service-runner.svg)](http://badge.fury.io/js/background-service-runner)
[![Build Status](https://travis-ci.org/darrylwest/background-service-runner.svg?branch=develop)](https://travis-ci.org/darrylwest/background-service-runner)
[![Dependency Status](https://david-dm.org/darrylwest/background-service-runner.svg)](https://david-dm.org/darrylwest/background-service-runner)

A daemon runner utility for node, python, shell and other executable services.  Can be configured to run a monitored or detached child process or groups of processes.

## Overview

Background Service Runner provides support for running executables in the background as detached, independent processes or as fully monitored child processes.  The typical use case is to create a short script to run a longer running service like an HTTP web service.  It can also be used to start and stop groups of services with a single script.

## Installation

	npm install background-service-runner --save

## Use

The following demonstrates a minimal run script that runs a job as a detached script.

    var runner = require('background-service-runner').createDaemonRunner(),
        command = __dirname + '/Job.js',
        child = runner.start( command );
        
    console.log('pid: ', child.pid);
    
By default the runner detaches from the child so that it may exit after spawning the child.  If you want the runner to exit immediately after spawning the job, then invoke start/stop like this:

	var child = runner.start();
	console.log( 'child running on pid: ', child.pid );
	runner.stop();

## Examples

There is a test runner and executable in the examples directory.  Invoke the test runner and observe the log file examples/job.log to see its entries.

## Tests

Unit tests written in mocha/chai/should and run using grunt.  All code tested with jshint.  

	make test
	
	- or -
	
	make watch
	
## Mocks

The project exposes two mocks for testing.

* MockSpawn
* MockChild
* MockDaemonRunner

See the existing tests for use, but generally you can use these mocks like this...

	var MockSpawn = require('background-service-runner').mocks.MockSpawn;
	
	...
	
	var mock = new MockSpawn(),
		opts = {
			log:log,
			spawn:mock.spawn
		},
		runner = new DaemonRunner( opts );
		
	var child = runner.start( 'mycommand', [ 'foo', 'bar' ] );
	
	should.exist( child );
	child.pid.should.be.above( 1000 );
	
	

_Note: works in linux/unix but not tested in windows._

- - -
<p><small><em>Copyright © 2014-2016, rain city software | Version 0.91.10</em></small></p>
