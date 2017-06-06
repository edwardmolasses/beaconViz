/**
 * @class WebAppRunnerTests
 *
 * @author: darryl.west@roundpeg.com
 * @created: 2014-06-29
 */
var should = require('chai').should(),
    dash = require('lodash'),
    log = require('simple-node-logger' ).createSimpleLogger(),
    IPFilter = require('../lib/IPFilter' ),
    Visitor = require('../lib/Visitor' ),
    WebAppRunner = require('../lib/WebAppRunner' ),
    MockChild = require( 'background-service-runner' ).mocks.MockChild,
    Dataset = require('./fixtures/TestDataset');

describe('WebAppRunner', function() {
    'use strict';

    log.setLevel('fatal');

    var dataset = new Dataset();

    var MockServiceRunner = function() {
        var runner = {};
        runner.start = function(command, args) {
            runner.command = command;
            runner.args = args;

            return new MockChild();
        };

        this.createDaemonRunner = function() {
            return runner;
        };
    };

    var MockConnection = function() {
        var conn = this;

        this.closed = true;

        this.close = function(cb) {
            conn.closed = true;

            if (cb) {
                cb();
            }
        };

        this.on = function(type, fn) {
            // simulate an event handler
        };
    };

    var MockConnect = function() {
        this.use = function() {

        };

        this.listen = function(port) {
            var conn = new MockConnection();

            conn.closed = false;

            return conn;
        };
    };

    var MockRequest = function(params) {
        var req = this;

        if (!params) {
            params = dataset.getAuthorizedVisitor();
        }

        this.method = params.method;
        this.url = params.url;
        this.connection = {};
        this.connection.remoteAddress = params.ip;

    };

    var MockResponse = function() {
        var resp = this,
            headers,
            output;

        this.writeHead = function(code, params) {
            headers = params;
        };

        this.end = function(text, cb) {
            output = text;
            cb();
        };

        this.getOutput = function() {
            return output;
        };

        this.getHeaders = function() {
            return headers;
        };
    };

    var createOptions = function() {
        var opts = {};

        opts.log = log;
        opts.port = dash.random( 1000, 20000 );
        opts.ipfilter = new IPFilter( opts );

        return opts;
    };

    describe('#instance', function() {
        var server = new WebAppRunner( createOptions() ),
            methods = [
                'start',
                'createApp',
                'logger',
                'landingPageRouter',
                'statusPage',
                'shutdown',
                'stop',
                'killme',
                '__protected'
            ];

        it('should be an instance of WebAppRunner', function() {
            should.exist( server );
            server.should.be.instanceof( WebAppRunner );
            server.__protected().runInstance.should.be.a('function');
        });

        it('should have all known methods by size and type', function() {
            dash.functions( server ).length.should.equal( methods.length );

            methods.forEach(function(method) {
                server[ method ].should.be.a('function');
            });
        });
    });

    describe('#runInstance', function() {
        var server,
            killed = false,
            opts = createOptions();

        opts.serviceRunner = new MockServiceRunner();
        server = new WebAppRunner( opts );
        server.killme = function() {
            killed = true;
        };

        it('should create a child instance and write the pid to process file', function() {
            var child = server.__protected().runInstance();

            should.exist( child );
            child.pid.should.be.above( 1000 );
        });
    });

    describe('shutdown', function() {
        var server = new WebAppRunner( createOptions() ),
            killed = false;

        server.killme = function() {
            killed = true;
        };

        it('should reject a shutdown request from non-local host ip', function(done) {
            var callback,
                visitor = dataset.getAuthorizedVisitor(),
                request = new MockRequest();

            request.visitor = visitor;
            request.url = visitor.url = '/shutdown';

            callback = function(err) {
                should.not.exist( err );

                done();
            };

            server.shutdown( request, {}, callback );
        });

        it('should issue a shutdown and stop from a local host ip', function(done) {
            var visitor = dataset.getAuthorizedVisitor(),
                request,
                response = new MockResponse();

            visitor.url = '/shutdown';

            response.end = function(text, callback) {
                should.exist( text );
                should.exist( callback );

                callback.should.be.a( 'function' );

                done();
            };

            visitor.ip = '::ffff:127.0.0.1';  // test for ip6
            visitor.url = '/shutdown';
            visitor.method = 'POST';
            request = new MockRequest( visitor );
            request.visitor = visitor;

            server.shutdown( request, response, null );

        });
    });

    describe('stop', function() {
        var server,
            killed = false,
            opts = createOptions();

        opts.connection = new MockConnection();
        opts.connection.closed = false;

        server = new WebAppRunner( opts );
        server.killme = function() {
            killed = true;
        };

        it('should close an open connection', function() {
            server.stop();

            opts.connection.closed.should.equal( true );
        });
    });

    describe('landingPageRouter', function() {
        it('should read the index page and write to mock response');
    });

    describe('logger', function() {
        it('should log visitors to a mock logger middleware object');
    });

    describe('createApp', function() {
        var server = new WebAppRunner( createOptions() );

        it('should create a connect app with middleware', function() {
            var app = server.createApp();
            should.exist( app );
            // console.log( app );

            app.stack.length.should.be.above( 4 );
        });
    });

    describe('start', function() {
        var server,
            killed = false,
            opts = createOptions();

        opts.app = new MockConnect();
        server = new WebAppRunner( opts );
        server.killme = function() {
            killed = true;
        };

        it('should start a mock server', function() {
            should.not.exist( server.__protected().connection );

            server.start();

            var conn = server.__protected().connection;

            should.exist( conn );
            conn.closed.should.equal( false );
        });
    });
});
