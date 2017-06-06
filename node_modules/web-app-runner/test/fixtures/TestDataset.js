/**
 * @class TestDataset
 *
 * @author: darryl.west@roundpeg.com
 * @created: 7/23/14 2:09 PM
 */
var Visitor = require('../../lib/Visitor');

var TestDataset = function() {
    'use strict';

    var dataset = this;

    this.createRequest = function() {
        var request = {
                url:'http://myhome.com',
                ip:'173.13.151.122',
                method:'GET',
                headers:{
                    'user-agent':'chrome/34'
                }
            };

        return request;
    };

    this.getAuthorizedVisitor = function() {
        var visitor = new Visitor( dataset.createRequest() );

        return visitor;
    };

    this.getRejectedVisitor = function() {
        var request = {
                url:'http://myhome.com',
                ip:'194.43.23.12',
                method:'GET',
                headers:{
                    'user-agent':'msie 5'
                }
            },
            visitor = new Visitor( request );

        return visitor;
    };

    this.createIPOptions = function() {
        var ip = {};

        ip.accept = dataset.getIPWhiteList();
        ip.reject = dataset.getIPBlackList();

        return ip;
    };

    this.getIPWhiteList = function() {
        var list = [];

        list.push( /^127\.0\.0\.1$/ );
        list.push( /^173\.13\.151\.1/ );

        return list;
    };

    this.getIPBlackList = function() {
        var list = [];

        list.push( /^194\.43\.23\.1/ );
        list.push( /^194\.43\.23\.2/ );
        list.push( /^194\.43\.22/ );

        return list;
    };
};

module.exports = TestDataset;