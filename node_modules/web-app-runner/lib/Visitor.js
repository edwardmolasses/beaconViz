/**
 * @class Visitor
 *
 * @author: darryl.west@roundpeg.com
 * @created: 7/22/14 6:52 PM
 */
var Visitor = function(request) {
    'use strict';

    this.url = request.url;
    this.ip = request.ip;
    this.method = request.method;
    this.agent = request.headers[ 'user-agent' ];
};

module.exports = Visitor;