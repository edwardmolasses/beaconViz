/**
 * @class MockChild
 *
 * @author: darryl.west@roundpeg.com
 * @created: 7/24/14 4:49 PM
 */
var dash = require('lodash');

var MockChild = function(options) {
    'use strict';

    var child = this,
        referenced = true,
        events = [];

    if (!options) options = {};

    this.domain = options.domain;
    this.connected = options.connected || false;
    this.signalCode = options.signalCode || null;
    this.exitCode = options.exitCode || null;
    this.killed = dash.isBoolean( options.killed ) ? options.killed : false;
    this.pid = options.pid || dash.random( 10000, 50000 );
    this.stdio = options.stdio || [ null, null, null ];

    this.unref = function() {
        referenced = false;
    };

    this.getReferenced = function() {
        return referenced;
    };

    this.on = function(type, handler) {
        events.push( { type:handler } );
    };

    this.getEvents = function() {
        return events;
    };

};

module.exports = MockChild;