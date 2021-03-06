// action starts at tuesday, 8am
var margin = {top: 105, right: 50, bottom: 50, left: 245 };
var width = 500 - margin.left - margin.right;
var height = 650 - margin.top - margin.bottom;
var padding = 3; // some kind of animation parameter for the effect of collision between nodes ??
var radius = 3.3;
var damper = 0.9;
var curr_minute = 1000;
var currTimeMoment;

// Short versions.
var occ_names = {
    "beacons":	{ "name": "Beacons", color: "#6b8ef7", count: 0 }
};



// Load data and let's do it.
d3.csv("data/qm_beacons.csv", function(error, data) {

    //                             _       _
    //  _ __  _ __ ___ _ __     __| | __ _| |_ __ _
    // | '_ \| '__/ _ | '_ \   / _` |/ _` | __/ _` |
    // | |_) | | |  __| |_) | | (_| | (_| | || (_| |
    // | .__/|_|  \___| .__/   \__,_|\__,_|\__\__,_|
    // |_|            |_|
    var inactiveBeaconKey = 'INACTIVE';
    var beaconList = [];
    var minDate;
    var maxDate;
    var dateFormat = 'YYYY-MM-DD HH:mm';
    var activeUsers = [];
    var fixAttendeeId = function(attId) {
        return 'ID-' + attId;
    };
    var buildBeaconListItem = function(beaconList, dataObj) {
        beaconList[dataObj['Beacon ID']] = {
            id: dataObj['Beacon ID'],
            name: dataObj['Beacon Name'],
            major: dataObj['Major Number'],
            minor: dataObj['Minor Number']
        };
    };
    var fixYear = function(date) {
        return '20' +
            date.split(' ')[0].split('-')[0] +
            '-' +
            date.split(' ')[0].split('-')[1] +
            '-' +
            date.split(' ')[0].split('-')[2] +
            ' ' +
            date.split(' ')[1];
    };
    var deepCopy = function(oldObj) {
        var newObj = oldObj;
        if (oldObj && typeof oldObj === 'object') {
            newObj = Object.prototype.toString.call(oldObj) === "[object Array]" ? [] : {};
            for (var i in oldObj) {
                newObj[i] = deepCopy(oldObj[i]);
            }
        }
        return newObj;
    };
    var pushActiveUser = function(userObj, activeUsers) {
        activeUsers[userObj['Attendee ID']] = {
            attendeeId: userObj['Attendee ID'],
            uuid: userObj['UUID'],
            beaconId: userObj['Beacon ID'],
            date: userObj['Date'],
            email: userObj['Email'],
            firstName: userObj['First Name'],
            lastName: userObj['Last Name'],
            majorNumber: userObj['Major Number'],
            minorNumber: userObj['Minor Number']
        };
    };
    var radialScale = function(x0, y0, r, keysArr) {
        var interPointDistance = 2 * Math.PI / (keysArr.length - 1);
        var coordArray = [];

        keysArr.forEach(function(key, index){
            var theta = index * interPointDistance;
            coordArray[key] = {
                x: x0 + r * Math.cos(theta),
                y: y0 + r * Math.sin(theta)
            };
        });

        return coordArray;
    };

    beaconList[inactiveBeaconKey] = {
        name: 'Inactive Users',
        major: 0,
        minor: 0
    };
    beaconList[inactiveBeaconKey]['id'] = inactiveBeaconKey;
    maxDate = minDate = fixYear(data[0]['Date']);
    data.forEach(function(item, index) {
        var tempItem;
        data[index]['Attendee ID'] = fixAttendeeId(item['Attendee ID']);
        buildBeaconListItem(beaconList, item);
        if (item['Date']) {
            item['Date'] = fixYear(item['Date']);
            minDate = moment.min(moment(minDate, dateFormat), moment(item['Date'], dateFormat)).format(dateFormat);
            maxDate = moment.max(moment(maxDate, dateFormat), moment(item['Date'], dateFormat)).format(dateFormat);
            data[index]['Date'] = item['Date'];
        }
        tempItem = deepCopy(item);
        tempItem['Beacon ID'] = inactiveBeaconKey;
        tempItem['Date'] = false;
        pushActiveUser(tempItem, activeUsers);
    });

    //           _
    //  ___  ___| |_ _   _ _ __
    // / __|/ _ \ __| | | | '_ \
    // \__ \  __/ |_| |_| | |_) |
    // |___/\___|\__|\__,_| .__/
    //                    |_|
    var beacons = beaconList;
    // activity to put in center of circle arrangement
    // coordinates for activities
    var x = d3.scale.ordinal()
        .rangePoints([0, width]);
    var xAxis = d3.svg.axis()
        .scale(x)
        .tickFormat(function(d) {
            return occ_names[d]['name'];
        })
        .orient("top");
    var y = d3.scale.ordinal()
        .domain(Object.keys(beacons))
        .rangePoints([0, height]);
    var yAxis = d3.svg.axis()
        .scale(y)
        .tickSize(40)
        .tickFormat(function(d) {
            return beacons[d]['id'];
        })
        .orient("left");
    // start the svg
    var svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var color = d3.scale.category20c();
    var indexOfInactiveBeacon = Object.keys(beaconList).indexOf('INACTIVE');
    var beaconKeys = Object.keys(beaconList);
    beaconKeys.splice(indexOfInactiveBeacon, 1);
    var radialBeaconScaleX0 = 0;
    var radialBeaconScaleY0 = 0;
    var radialBeaconScale = radialScale(radialBeaconScaleX0, radialBeaconScaleY0, 10, beaconKeys);
    // radialBeaconScale['INACTIVE'] = {radialBeaconScaleX0,radialBeaconScaleY0};
    // var color = function(i) {
    //     return '#0B7FB2';
    // };

    //                     _
    //  _ __ ___ _ __   __| | ___ _ __
    // | '__/ _ | '_ \ / _` |/ _ | '__|
    // | | |  __| | | | (_| |  __| |
    // |_|  \___|_| |_|\__,_|\___|_|
    // axes (note: placing the text labels on x and y axes)
    // x.domain(d3.map(data, function(d) { return d.grp; }).keys());
    x.domain(['beacons']);

    // note: first place the location labels on y
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(-70,-10)")
        .call(yAxis)
        .selectAll(".tick text");
    // note: then place the work type labels on x
    // svg.append("g")
    //     .attr("class", "x axis")
    //     .attr("transform", "translate(0,-100)")
    //     .call(xAxis)
    //     .selectAll(".tick text");

    // counters
    // var counter = svg.selectAll(".counter")
    //     .data(Object.keys(occ_names))
    //     .enter().append("g")
    //     .attr("class", "counter")
    //     .attr("transform", function(d) { return "translate("+x(d)+",-60)"; })
    //     .append("text")
    //     .attr("text-anchor", "middle")
    //     .text(function(d,i) {
    //         if (i == 0) {
    //             return readablePercent(occ_names[d].count) + " Working";
    //         } else {
    //             return readablePercent(occ_names[d].count);
    //         }
    //     });

    var nodes = [];
    for (userId in activeUsers) {
        var user = activeUsers[userId];
        var init_x = x('beacons') + Math.random();
        var init_y = y(user.beaconId) + Math.random();
        var col = "#cccccc";
        // radialBeaconScale(user.beaconId)

        nodes.push({
            attendeeId: userId,
            grp: 'beacons',
            act: user.beaconId,
            next: user.beaconId,
            radius: radius,
            x: init_x,
            y: init_y,
            color: col
        });
    }

    var force = d3.layout.force()
        .nodes(nodes)
        .size([width, height])
        .gravity(0)
        .charge(0)
        .friction(.9)
        .on("tick", tick)
        .start();
    var circle = svg.selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", function(d) { return d.radius; })
        .attr("fill",function(d,i){return color(i);});

    // Update nodes based on activity and duration
    var intervalId = window.setInterval(timer, 100);
    function timer() {
        currTimeMoment = moment(minDate, dateFormat).add(curr_minute, 'minutes');

        if (currTimeMoment.isAfter(moment(maxDate, dateFormat))) { // stop timer after last event
            clearInterval(intervalId);
            d3.select("#current_time").text('Finished!');
            return;
        }
        // loop through data, and check activeUsers for each id
        // if the dataPoint is after the currentTime and the (next) beaconId is different from
        // that of the corresponding activeUser, then change the (next) beaconId on the activeUser
        data.map(function(dataPoint){
            var isDataPointInPast = currTimeMoment.isAfter(moment(dataPoint['Date'], dateFormat));
            var activeUserBeaconId = activeUsers[dataPoint['Attendee ID']]['beaconId'];
            var isBeaconChanged = dataPoint['Beacon ID'] !== activeUserBeaconId;
            if (isDataPointInPast && isBeaconChanged) {
                activeUsers[dataPoint['Attendee ID']]['beaconId'] = dataPoint['Beacon ID'];
            }
        });

        // then for each node, check if the activeUser beaconId is different, and if so change the beaconId on the node
        nodes.map(function(node, i) {
            var activeUserBeaconId = activeUsers[node.attendeeId]['beaconId'];
            var isBeaconChanged = node.next !== activeUserBeaconId;
            if (isBeaconChanged) {
                nodes[i].next = activeUserBeaconId;
            }
        });

        force.resume();
        curr_minute += 1;

        // Update percentages
        // ...

        // Update time
        d3.select("#current_time").text(currTimeMoment.format('dddd h:mm a'));
    }

    function tick(e) {
        var k = 0.1 * e.alpha;

        // Push nodes toward their designated focus.
        nodes.forEach(function(o, i) {
            o.x += (x('beacons') - o.x) * k * damper;
            o.y += (y(o.next) - o.y) * k * damper;
        });

        circle
            .each(collide(.5))
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("fill",function(d,i){return color(i);});
    }

    // Resolve collisions between nodes.
    function collide(alpha) {
        var quadtree = d3.geom.quadtree(nodes);
        return function(d) {
            var r = d.radius + radius + padding,
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
            quadtree.visit(function(quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== d)) {
                    var x = d.x - quad.point.x,
                        y = d.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = d.radius + quad.point.radius + (d.next !== quad.point.next) * padding;
                    if (l < r) {
                        l = (l - r) / l * alpha;
                        d.x -= x *= l;
                        d.y -= y *= l;
                        quad.point.x += x;
                        quad.point.y += y;
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
        };
    }
}); // @end d3.csv


// Output readable percent based on count.
function readablePercent(n) {
    var pct = 100 * n / 75;

    if (pct < 1 && pct > 0) {
        pct = "<1%";
    } else {
        pct = Math.round(pct) + "%";
    }

    return pct;
}
