/**
 * @class WebAppRunner
 *
 * @author: darryl.west@roundpeg.com
 * @created: 2014-06-29
 */
var connect = require( 'connect' ),
    dash = require('lodash' ),
    os = require( 'os' ),
    IPFilter = require('./IPFilter' ),
    Visitor = require('./Visitor' ),
    gzipStatic = require( 'connect-gzip-static' );

var WebAppRunner = function(options) {
    'use strict';

    var server = this,
        log = options.log,
        fs = options.fs || require('fs' ),
        serviceRunner = options.serviceRunner || require('background-service-runner' ),
        port = options.port,
        home = options.home || __dirname,
        env = options.env || 'development',
        epoch = new Date(),
        startPage = options.startPage,
        ipfilter = options.ipfilter,
        daemon = dash.isBoolean( options.daemon ) ? options.daemon : false,
        app = options.app,
        connection = options.connection;

    /**
     * create the connect app object and add the middleware.  this is exposed to enable additional middleware
     */
    this.createApp = function() {
        if (!app) {
            log.info('start the application at port: ', port);

            app = connect();

            app.use( ipfilter.authorize );
            app.use( server.shutdown );

            app.use( server.logger );

            app.use( server.landingPageRouter );
            app.use( server.statusPage );

            app.use( gzipStatic( home ) );
        }

        return app;
    };

    /**
     * start the server; if app is not created, then create it.
     */
    this.start = function() {
        if (!app) {
            server.createApp();
        }

        log.info('listening on port: ', port, ', from home: ', home, ', with env: ', env);
        connection = app.listen( port );

        connection.on('close', function() {
            server.killme();
        });
    };

    /**
     * route the default index page
     *
     * @param request
     * @param response
     * @param next
     */
    this.landingPageRouter = function(request, response, next) {
        var url = request.url,
            html = startPage;

        if (html && (url === '/' || url.indexOf('/index.') === 0)) {
            response.writeHead(200, {
                'Content-Length': html.length,
                'Content-Type': 'text/html'
            });

            log.debug( html );

            response.end( html );
        } else {
            next();
        }
    };

    this.statusPage = function(request, response, next) {
        var url = request.url,
            obj,
            json;

        if (url === '/status') {
            obj = {};
            obj.env = env;
            obj.epoch = epoch.toISOString();
            obj.updays = Math.round( (Date.now() - epoch.getTime()) / (1000 * 60 * 60 * 24) );
            obj.uphours = Math.round( (Date.now() - epoch.getTime()) / (1000 * 60 * 60) );
            obj.pid = process.pid;

            obj.totalmem = os.totalmem();
            obj.freemem = os.freemem();
            obj.arch = os.arch();

            json = JSON.stringify( obj );

            response.writeHead(200, {
                'Content-Length': json.length,
                'Content-Type': 'application/json'
            });

            log.info( json );
            response.end( json );
        } else {
            next();
        }
    };

    /**
     * shutdown middleware.
     * @param request
     * @param response
     * @param next
     */
    this.shutdown = function(request, response, next) {
        var visitor = request.visitor,
            url = request.url,
            method = request.method,
            msg;

        if (visitor && url === '/shutdown' && method === 'POST') {
            log.info('shutdown request from ip: ', visitor.ip, ', url: ', url);

            if (dash.endsWith( visitor.ip, '127.0.0.1')) {
                msg = [ 'shutting down from pid: ', process.pid, '\n' ].join('');

                response.writeHead(200, {
                    'Content-Length': msg.length,
                    'Content-Type': 'text/plain'
                });

                response.end( msg, function(err) {
                    log.info('sent, now closing...');
                    process.nextTick( server.stop );
                    server.killme();
                });
            } else {
                log.warn('shutdown rejected, bad ip: ', visitor.ip);
                next();
            }
        } else {
            next();
        }
    };

    /**
     * stop the service; override this to implement a shutdown hook
     */
    this.stop = function() {
        if (connection) {
            log.info('closing connection...');
            connection.close();
        } else {
            log.warn('stop called but app is null...');
        }
    };

    /**
     * standard logger outputs the visitor in json
     *
     * @param request
     * @param response
     * @param next
     */
    this.logger = function(request, response, next) {
        var visitor = request.visitor;

        if (!visitor) {
            visitor = new Visitor( request );
            request.visitor = visitor;
        }

        log.info( 'request: ', JSON.stringify( visitor ));

        next();
    };

    var runInstance = function() {
        var childKey = '--run-child-service',
            args = dash.toArray( process.argv ),
            runner,
            child,
            command;

        args.shift();

        if (args[ 1 ] === childKey) {
            server.start();
        } else {
            command = args.shift();
            args.unshift( childKey );

            runner = serviceRunner.createDaemonRunner();
            child = runner.start( command, args );

            log.info('running child pid: ', child.pid);

            server.killme();
        }

        return child;
    };

    /**
     * does a simple process kill; as a public method, it's easy to mock out
     */
    this.killme = function() {
        log.info('killing pid: ', process.pid);

        setTimeout(function() {
            process.kill( process.pid );
        }, 100);
    };

    this.__protected = function() {
        return {
            port:port,
            connection:connection,
            runInstance:runInstance
        };
    };

    // constructor validations
    if (!log) throw new Error('socket server must be constructed with a log');
    if (!port) throw new Error('socket server must be constructed with a port');

    if (daemon && daemon === true) {
        runInstance();
    }
};

// replace this with a bootstrap starter...
WebAppRunner.createInstance = function(opts) {
    'use strict';

    var Logger = require('simple-node-logger' ),
        runner,
        conf;

    if (!opts) {
        opts = {};
    } else if (opts.configFile) {

        // TODO refactor to use require to read in the file? or see if there is a specific
        // settings file to read and re-read
        conf = opts.configFile;

        opts = conf.readConfig();

        if (typeof conf.readFilters === 'function') {
            // assign the dynamic reader and read in

            opts.readFilters = conf.readFilters;
            opts.filters = conf.readFilters();
        }

        if (typeof conf.readLoggerConfig === 'function') {
            // determine if this is a rolling logger...
            opts.log = Logger.createRollingFileLogger( conf.readLoggerConfig() );
        }
    }

    if (!opts.log) {
        if (opts.logfile) {
            opts.log = Logger.createSimpleFileLogger( opts.logfile );
        } else {
            opts.log = Logger.createSimpleLogger();
        }
    }

    if (!opts.ipfilter) {
        opts.ipfilter = new IPFilter( opts );
    }

    if (!opts.port) {
        opts.port = 3000;
    }

    if (!opts.home) {
        opts.home = './public';
    }

    if (!opts.env) {
        opts.env = 'development';
    }

    runner = new WebAppRunner( opts );

    return runner;
};

module.exports = WebAppRunner;
