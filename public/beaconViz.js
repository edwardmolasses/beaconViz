var browserWidth = document.body.clientWidth;
var margin = {top: 105, right: 50, bottom: 50, left: 145 };
var width = browserWidth - margin.left - margin.right;
var height = 450 - margin.top - margin.bottom;
var particleRadius = 5.8;
var padding = 3; // some kind of animation parameter for the effect of collision between nodes ???
var damper = 0.9;
var beaconList = [];
var minDate;
var maxDate;
var dateFormat = 'YYYY-MM-DD HH:mm';
var regularSpeed = 100;
var speed = regularSpeed;
var curMinute = 0;
var currTimeMoment;
var activeUsers = [];
var nodes = [];
var inactiveBeaconKey = 'INACTIVE';
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
var fixAttendeeId = function(attId) {
    return 'ID-' + attId;
};
var getOriginalAttendeeId = function(fixedAttId) {
    return fixedAttId.split('ID-')[1];
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
var populateNodes = function(userList, axisScale) {
    nodes = [];
    for (var key in userList) {
        if (!userList.hasOwnProperty(key)) continue;
        userList[key]['init_x'] = axisScale(inactiveBeaconKey) + Math.random();
        userList[key]['init_y'] = 50  + Math.random();
        userList[key]['cx'] = userList[key]['init_x'];
        userList[key]['cy'] = userList[key]['init_y'];
        nodes.push(userList[key]);
    }
};

d3.csv("data/qm_beacons.csv", function(error, data) {

    //                             _       _
    //  _ __  _ __ ___ _ __     __| | __ _| |_ __ _
    // | '_ \| '__/ _ | '_ \   / _` |/ _` | __/ _` |
    // | |_) | | |  __| |_) | | (_| | (_| | || (_| |
    // | .__/|_|  \___| .__/   \__,_|\__,_|\__\__,_|
    // |_|            |_|

    beaconList[inactiveBeaconKey] = {
        name: 'Inactive Users',
        major: 0,
        minor: 0
    };
    beaconList[inactiveBeaconKey]['id'] = inactiveBeaconKey;
    maxDate = minDate = fixYear(data[0]['Date']);
    var tempItem;
    data.forEach(function(item, index) {
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
    console.log('%c[beaconViz.js:52]\ndata \n(see below): ','font-size:25px;color:tomato;'); console.log(data);
    console.log('%c[beaconViz.js:55]\nbeaconList \n(see below): ','font-size:25px;color:yellowgreen;'); console.log(beaconList);
    console.log('%c[beaconViz.js:55]\nactiveUsers \n(see below): ','font-size:25px;color:pink;'); console.log(activeUsers);
    // debugger;

    //  _ __ ___   __ _ _ __
    // | '_ ` _ \ / _` | '_ \
    // | | | | | | (_| | |_) |
    // |_| |_| |_|\__,_| .__/
    //                 |_|

    // create the scale we will use for the axis
    var x = d3.scale.ordinal()
    .rangePoints([0, width - (margin.left + margin.right)]);
    x.domain(Object.keys(beaconList));
    //  var axisScale = d3.scale.ordinal()
    //                   .domain(Object.keys(beaconList))
    //                   .rangePoints([0, width - (margin.left + margin.right)]);

    // create the axis
    var xAxis = d3.svg.axis()
    .scale(x)
    .tickFormat(function(d) {
      return beaconList[d]['id'];
    });

    populateNodes(activeUsers, x);
    function tick(e) {
      var k = 0.1 * e.alpha;

      // Push nodes toward their designated focus.
      nodes.forEach(function(o, i) {
          // debugger;
          var curr_act = o.act;

          // if (curr_act == "w") {
          //     o.color = colorByOcc(o.grp);
          // } else {
          //     o.color = "#cccccc";
          // }
          o.x += (x(o.beaconId) - o.x + margin.left) * k * damper;
          o.y += (50 - o.y) * k * damper;
      });

      circle
          .each(collide(.5))
          .style("fill", function(d) { return "#eee"; })
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    }
    function collide(alpha) {
        var quadtree = d3.geom.quadtree(nodes);
        return function(d) {
            var r = particleRadius + padding,
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
            quadtree.visit(function(quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== d)) {
                    var x = d.x - quad.point.x,
                        y = d.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = d.radius + quad.point.radius + (d.where !== quad.point.where) * padding;
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

    //                     _
    //  _ __ ___ _ __   __| | ___ _ __
    // | '__/ _ | '_ \ / _` |/ _ | '__|
    // | | |  __| | | | (_| |  __| |
    // |_|  \___|_| |_|\__,_|\___|_|

    // create the svg viewport
    var svgContainer = d3.select("body").append("svg")
                                       .attr("width", width)
                                       .attr("height", height);

    // create an svg group element for the axis elements and call the xaxis function
    var xAxisLabel2y = margin.top + 10;
    var xAxisGroup = svgContainer.append("g")
                                 .attr("class", "x axis")
                                 .call(xAxis)
                                 .attr("transform", "translate(" + margin.left + ",0)");

    var force = d3.layout.force()
        .nodes(nodes)
        .size([width, height])
        .gravity(0)
        .charge(0)
        .friction(.9)
        .on("tick", tick)
        .start();

    var circle = svgContainer.selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", function(d) { return 5.8; })
        .style("fill", function(d) { return d.color; });

    //       _            _
    //   ___| | ___   ___| | __
    //  / __| |/ _ \ / __| |/ /
    // | (__| | (_) | (__|   <
    //  \___|_|\___/ \___|_|\_\

    var intervalId = window.setInterval(timer, speed);
    function timer() {
        currTimeMoment = moment(minDate, dateFormat).add(curMinute, 'minutes');
        if (currTimeMoment.isAfter(moment(maxDate, dateFormat))) { // stop timer after last event
            clearInterval(intervalId);
            d3.select("#current_time").text('Finished!');
        } else {
            curMinute += 1;
            d3.select("#current_time").text(currTimeMoment.format('dddd h:mma'));
            data.forEach(function(item) {
                if (moment(item['Date'], dateFormat).isSame(currTimeMoment)) {
                    if (item['Attendee ID']) {
                        pushActiveUser(item, activeUsers);
                    }
                }
            });
            populateNodes(activeUsers, x);
            d3.range(nodes.length).map(function(i) {
              var curr_node = nodes[i];
              curr_node.cx = x(curr_node.beaconId);
              curr_node.cy = 50;
            });
            // console.log('%c[beaconViz.js:116]\nactiveUsers \n(see below): ','font-size:25px;color:teal;'); console.log(activeUsers);
            console.log('%c[beaconViz.js:125]\nnodes \n(see below): ','font-size:25px;color:steelblue;'); console.log(nodes);
        }
        force.resume();
    }
});
