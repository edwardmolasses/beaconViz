/**
 * @class IPFilter
 *
 * @author: darryl.west@roundpeg.com
 * @created: 7/22/14 6:27 PM
 */
var dash = require( 'lodash' ),
    fs = require('fs' ),
    Visitor = require('./Visitor');

var IPFilter = function(options) {
    'use strict';

    var filter = this,
        log = options.log,
        rejectThrottleTime = options.rejectThrottleTime || 5000,
        rejectPage,
        acceptUnknownVisitor = true,
        whiteList,
        blackList;

    if (options.ip) {
        whiteList = options.ip.accept;
        blackList = options.ip.reject;

        if (dash.isBoolean( options.acceptUnknownVisitor )) {
            acceptUnknownVisitor = options.ip.acceptUnknownVisitor;
        }

        rejectPage = options.ip.rejectPage;
    }

    this.authorize = function(request, response, next) {
        var visitor = request.visitor;

        if (!visitor) {
            visitor = new Visitor( request );
            request.visitor = visitor;
        }

        if (!visitor.ip) {
            visitor.ip = filter.getRemoteAddress( request );
        }

        // first check the white lists
        if (filter.isWhiteList( visitor )) {
            log.info('white listed: ', JSON.stringify( visitor ));
            return next();
        }

        // now check the black lists
        if (filter.isBlackList( visitor )) {
            log.warn('reject the visitor: ', JSON.stringify( visitor ));

            return filter.reject( request, response );
        }

        if (acceptUnknownVisitor) {
            log.info('unknown visitor: ', JSON.stringify( visitor ));

            // cache this visitor?

            return next();
        }

        filter.reject( request, response );
    };

    /**
     *
     * @param request
     * @returns {*}
     */
    this.getRemoteAddress = function(request) {
        if (request.ip) return request.ip;
        if (request._removeAddress) return request._remoteAddress;
        if (request.connection.remoteAddress) return request.connection.remoteAddress;
    };

    /**
     * return true if this visitor is in the white list
     *
     * @param visitor
     * @returns {boolean}
     */
    this.isWhiteList = function(visitor) {
        if (whiteList && visitor.ip) {
            return findMatch( visitor.ip, whiteList );
        }

        return false;
    };

    /**
     * return true if this visitor is in the black list
     *
     * @param visitor
     * @returns {boolean}
     */
    this.isBlackList = function(visitor) {
        if (blackList && visitor.ip) {
            return findMatch( visitor.ip, blackList );
        }

        return false;
    };

    var findMatch = function(ip, list) {
        return list.some(function(rx) {
            return ip.match( rx );
        });
    };

    /**
     * reject this request with a very slow non-error response...
     *
     * @param request
     * @param response
     */
    this.reject = function(request, response) {
        var visitor = request.visitor,
            msg;

        if (visitor) {
            msg = 'rejecting request from ip: ' + visitor.ip;
        } else {
            msg = 'rejecting visitor to: ' + request.url;
        }

        log.warn( msg );
        setTimeout(function() {
            if (rejectPage) {
                response.end( rejectPage );
            } else {
                response.end('thanks for stopping bye...');
            }
        }, rejectThrottleTime);
    };

    this.__protected = function() {
        return {
            whiteList:whiteList,
            blackList:blackList,
            acceptUnknownVisitor:acceptUnknownVisitor,
            rejectPage:rejectPage
        };
    };

    // constructor validations
    if (!log) throw new Error('socket server must be constructed with a log');
};

module.exports = IPFilter;