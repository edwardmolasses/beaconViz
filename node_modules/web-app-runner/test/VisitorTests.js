/**
 * @class VisitorTests
 *
 * @author: darryl.west@roundpeg.com
 * @created: 7/22/14 7:20 PM
 */
var should = require('chai').should(),
    dash = require('lodash'),
    log = require('simple-node-logger' ).createSimpleLogger(),
    Visitor = require('../lib/Visitor');

describe('Visitor', function() {
    'use strict';

    var createRequest = function() {
        var opts = {};

        opts.ip = '127.0.0.1';
        opts.method = 'GET';
        opts.headers = {
            'user-agent':'mozilla'
        };
        opts.url = 'http://mypage.com';

        return opts;
    };

    describe('#instance', function() {
        var opts = createRequest(),
            visitor = new Visitor( opts );

        it('should be an instance of Visitor', function() {
            should.exist( visitor );
            visitor.should.be.instanceof( Visitor );

            visitor.ip.should.equals( opts.ip );
            visitor.method.should.equals( opts.method );
            visitor.agent.should.equals( opts.headers[ 'user-agent' ]);
            visitor.url.should.equal( opts.url );
        });
    });
});
