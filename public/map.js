// action starts at tuesday, 8am
var margin = {top: 50, right: 50, bottom: 50, left: 0 };
var width = 1500 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;
var padding = 3; // some kind of animation parameter for the effect of collision between nodes ??
var radius = 4;
var damper = 0.9;
var curr_minute = 1100;
var currTimeMoment;
var radialX0 = 0;
var radialY0 = 0;
var xAdjust = 100;
var yAdjust = 0;

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
    var mapScale = function(x0, y0, r, keysArr) {
        var coordArray = [];

        keysArr.forEach(function(key, index){
            switch (key) {
                case "Beacon1":
                    coordArray[key] = {x: 580 + xAdjust +x0, y: 410 + y0}; // entrance - left
                    break;
                case "B42YDUJ":
                    coordArray[key] = {x: 750 + xAdjust +x0, y: 410 + y0}; // entrance - right
                    break;
                case "B134EQBK":
                    coordArray[key] = {x: 630 + xAdjust +x0, y: 510 + y0}; // coat room
                    break;
                case "B135TISL":
                    coordArray[key] = {x: 660 + xAdjust +x0, y: 460 + y0}; // entrance - bottom
                    break;
                case "B122ODGI":
                    coordArray[key] = {x: 720 + xAdjust +x0, y: 120 + y0}; // logistics
                    break;
                case "B133RHQY":
                    coordArray[key] = {x: 660 + xAdjust +x0, y: 360 + y0}; // entrance - top
                    break;
                case "B1XCBN":
                    coordArray[key] = {x: 250 + xAdjust +x0, y: 410 + y0}; // bottom left
                    //coordArray[key] = {x: 0, y: 0};
                    break;
            }
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
    //var color = d3.scale.category20c();
    var color = function(i) { return '#159bc7'; };
    //var color = function(i) { return '#333'; };
    var indexOfInactiveBeacon = Object.keys(beaconList).indexOf('INACTIVE');
    var beaconKeys = Object.keys(beaconList);
    beaconKeys.splice(indexOfInactiveBeacon, 1);
    var radialBeaconScaleX0 = radialX0;
    var radialBeaconScaleY0 = radialY0;
    var radialBeaconScale = mapScale(0, 0, 150, beaconKeys);
    radialBeaconScale['INACTIVE'] = {x: 560, y: 260};

    //                     _
    //  _ __ ___ _ __   __| | ___ _ __
    // | '__/ _ | '_ \ / _` |/ _ | '__|
    // | | |  __| | | | (_| |  __| |
    // |_|  \___|_| |_|\__,_|\___|_|
    // axes (note: placing the text labels on x and y axes)
    // x.domain(d3.map(data, function(d) { return d.grp; }).keys());
    var radialBeaconScaleTicks = mapScale(-20, -20, 150, beaconKeys);
    x.domain(['beacons']);
    // beaconKeys.map(function(beaconName){
    //    var coords = radialBeaconScaleTicks[beaconName];
    //
    //    svg.append("text")
    //        .attr("x", coords.x - 40)
    //        .attr("y", coords.y)
    //        .style('fill', 'black')
    //        .attr("class", 'beacon-tick')
    //        .text(beaconName);
    // });

    var nodes = [];
    for (userId in activeUsers) {
        var user = activeUsers[userId];
        var col = "#cccccc";
        var initCoords = radialBeaconScale[user.beaconId];
        //var init_x = x('beacons') + Math.random();
        //var init_y = y(user.beaconId) + Math.random();
        var init_x = initCoords.x + Math.random();
        var init_y = initCoords.y + Math.random();

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

        // Update time
        d3.select("#current_time").text(currTimeMoment.format('dddd h:mm a'));
    }

    function tick(e) {
        var k = 0.1 * e.alpha;

        // Push nodes toward their designated focus.
        nodes.forEach(function(o, i) {
            var coords = radialBeaconScale[o.next];
            o.x += (coords.x - o.x) * k * damper;
            o.y += (coords.y - o.y) * k * damper;
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
