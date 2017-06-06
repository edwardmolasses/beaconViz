/**
 * @class IPFilterTests
 *
 * @author: darryl.west@roundpeg.com
 * @created: 7/22/14 6:28 PM
 */
var should = require('chai').should(),
    dash = require('lodash'),
    log = require('simple-node-logger' ).createSimpleLogger(),
    Dataset = require('./fixtures/TestDataset' ),
    IPFilter = require('../lib/IPFilter');

describe('IPFilter', function() {
    'use strict';

    var createOptions,
        dataset = new Dataset();

    // suppress the log statements
    log.setLevel('fatal');

    createOptions = function() {
        var opts = {};

        opts.log = log;

        opts.ip = dataset.createIPOptions();

        return opts;
    };

    describe('#instance', function() {
        var filter = new IPFilter( createOptions() ),
            methods = [
                'authorize',
                'getRemoteAddress',
                'isWhiteList',
                'isBlackList',
                'reject',
                '__protected'
            ];

        it('should be an instance of IPFilter', function() {
            should.exist( filter );
            filter.should.be.instanceof( IPFilter );

            filter.__protected().whiteList.length.should.equal( 2 );
            filter.__protected().blackList.length.should.equal( 3 );
            filter.__protected().acceptUnknownVisitor.should.equal( true );
        });

        it('should have all known methods by size and type', function() {
            dash.functions( filter ).length.should.equal( methods.length );

            methods.forEach(function(method) {
                filter[ method ].should.be.a('function');
            });
        });
    });

    describe('authorize', function() {
        var filter = new IPFilter( createOptions() );

        it('should authorize a known ip address', function(done) {
            var request = {},
                response = {},
                next;

            request.visitor = dataset.getAuthorizedVisitor();

            next = function() {
                done();
            };

            filter.authorize( request, response, next );
        });

        it('should reject a known ip address', function(done) {
            var request = {},
                response = {},
                next;

            request.visitor = dataset.getRejectedVisitor();

            next = function() {
                throw new Error('should reject ip: ' + request.visitor.ip);
            };

            filter.reject = function(request, response) {
                done();
            };

            filter.authorize( request, response, next );
        });
    });

    describe('isWhiteList', function() {
        var filter = new IPFilter( createOptions() );

        it('should return true for a known good ip', function() {
            var visitor = dataset.getAuthorizedVisitor();

            filter.isWhiteList( visitor ).should.equal( true );
        });

        it('should return false for an unrecognized ip', function() {
            var visitor = dataset.getAuthorizedVisitor();

            visitor.ip = '255.255.255.255';

            filter.isWhiteList( visitor ).should.equal( false );
        });
    });

    describe('isBlackList', function() {
        var filter = new IPFilter( createOptions() );

        it('should return true for a known reject ip', function() {
            var visitor = dataset.getRejectedVisitor();

            filter.isBlackList( visitor ).should.equal( true );
        });

        it('should return false for an ip not in the black list', function() {
            var visitor = dataset.getRejectedVisitor();

            visitor.ip = '127.0.0.1';
            filter.isBlackList( visitor ).should.equal( false );
        });
    });
});
