/**
 * @class DaemonRunnerTests
 *
 * @author: darryl.west@roundpeg.com
 * @created: 7/24/14 9:15 AM
 */
var should = require('chai').should(),
    dash = require('lodash'),
    log = require('simple-node-logger' ).createSimpleLogger(),
    DaemonRunner = require('../lib/DaemonRunner' ),
    MockSpawn = require('./mocks/MockSpawn');

describe('DaemonRunner', function() {
    'use strict';

    log.setLevel('fatal');

    var createOptions = function() {
        var opts = {};

        opts.log = log;

        return opts;
    };

    describe('#instance', function() {
        var runner = new DaemonRunner( createOptions() ),
            methods = [
                'start',
                'stop',
                'verifyCommandFile',
                '__protected'
            ];

        it('should be an instance of DaemonRunner', function() {
            should.exist( runner );

            runner.should.be.instanceof( DaemonRunner );

            runner.__protected().stdio.length.should.equal( 3 );
            should.exist( runner.__protected().cwd );
        });

        it('should have all known methods by size and type', function() {
            dash.functions( runner ).length.should.equal( methods.length );

            methods.forEach(function(method) {
                runner[ method ].should.be.a('function');
            });
        });
    });

    describe('start', function() {
        var opts = createOptions(),
            mock = new MockSpawn();

        opts.spawn = mock.spawn;

        it('should start a mock command', function() {
            var runner = new DaemonRunner( opts ),
                cmd = __dirname + '/fixtures/test-script.sh',
                args = [ 'foo', 'bar' ],
                child;

            child = runner.start( cmd, args );
            should.exist( child );

            mock.getCommand().should.equal( cmd );
            mock.getArgs().should.equal( args );

            should.exist( mock.getSpawnOptions() );

            child.pid.should.be.above( 1000 );
            child.getReferenced().should.equal( false );


        });
    });
});
