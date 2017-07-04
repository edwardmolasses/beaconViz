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
        userList[key]['x'] = userList[key]['init_x'];
        userList[key]['y'] = userList[key]['init_y'];
        nodes.push(userList[key]);
    }
};


// var margin = {top: 105, right: 50, bottom: 50, left: 245 },
    // width = 1800 - margin.left - margin.right,
    // height = 450 - margin.top - margin.bottom,
var padding = 3, // some kind of animation parameter for the effect of collision between nodes ???
    radius = 5.8,
    damper = 0.9;

var sched_objs = [],
    curr_minute = 0;

// Simplified
var act_codes = {
    "w": {"short": "Work", "desc": "At Workplace"},
    "o": {"short": "Other", "desc": "Somewhere Else"},
    "h" : {"short": "Home-Sleeping", "desc": "Home or Sleeping"},
};

// Short versions.
var occ_names = {
    "11":	{ "name": "Management, Business", color: "#6b8ef7", count: 0 },
    "12":	{ "name": "Professional", color: "#05b1b5", count: 0 },
    "13":	{ "name": "Services", color: "#38c40a", count: 0 },
    "14":	{ "name": "Sales", color: "#dd5a62", count: 0 },
    "15":	{ "name": "Administrative", color: "#eca0a5", count: 0 },
    "16":	{ "name": "Farming", color: "#fedc5b", count: 0 },
    "17":	{ "name": "Construction", color: "#cf6001", count: 0 },
    "18":	{ "name": "Maintenance, Repair", color: "#fe7805", count: 0 },
    "19":	{ "name": "Production", color: "#fe9338", count: 0 },
    "20":	{ "name": "Transportation", color: "#ffd3ae", count: 0 },
}



// Load data and let's do it.
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

    var x = d3.scale.ordinal()
    .rangePoints([0, width - (margin.left + margin.right)]);

    var xAxis = d3.svg.axis()
    .scale(x)
    .tickFormat(function(d) {
      return beaconList[d]['id'];
    })
    .orient("top");

    // var x = d3.scale.ordinal()
    // .rangePoints([0, width]);
    // var xAxis = d3.svg.axis()
    // .scale(x)
    // .tickFormat(function(d) {
    //   return occ_names[d]['name'];
    // })
    // .orient("top");

    // var y = d3.scale.ordinal()
    // .domain(Object.keys(act_codes))
    // .rangePoints([0, height]);
    // var yAxis = d3.svg.axis()
    // .scale(y)
    // .tickSize(40)
    // .tickFormat(function(d) {
    //   console.log(Object.keys(act_codes));
    //   return act_codes[d]['desc'];
    // })
    // .orient("left");


    // Start the SVG
    var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xAxis = d3.svg.axis()
    .scale(x)
    .tickFormat(function(d) {
      return beaconList[d]['id'];
    });

    //
    // Axes (note: placing the text labels on x and y axes)
    //
    x.domain(Object.keys(beaconList));
    // x.domain(d3.map(data, function(d) { return d.grp; }).keys());
    // note: then place the work type labels on x
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0,-100)")
        .call(xAxis)
        .selectAll(".tick text")
        .call(wrap, x.rangeBand());

    populateNodes(activeUsers, x);
    console.log('nodes: ',nodes);
    // //
    // // Store data
    // //
    // data.forEach(function(d) {
    //     var day_array = d.day.split(",");
    //     var activities = [];
    //     for (var i=0; i < day_array.length; i++) {
    //         // Duration
    //         if (i % 2 == 1) {
    //             activities.push({
    //                 'grp': d.grp,
    //                 'act': day_array[i-1].substring(1),
    //                 'where': day_array[i-1].substring(0, 1),
    //                 'duration': +day_array[i]});
    //         }
    //     }
    //     sched_objs.push(activities);
    // });
    //
    //
    // // A node for each person's schedule
    // var nodes = sched_objs.map(function(o,i) {
    //     // debugger;
    //     var init = o[0];
    //     var init_x = x(init.grp) + Math.random();
    //     // add some randomization to the placement of the node in relation to exact .grp location on ordinal scale x-axis
    //     var init_y = y(init.where) + Math.random();
    //     if (init.act == "w") {
    //         colorByOcc(init.grp)
    //         occ_names[init.grp].count += 1;
    //     } else {
    //         var col = "#cccccc";
    //     }
    //     return {
    //         grp: init.grp,
    //         act: init.act,
    //         where: init.where,
    //         radius: radius,
    //         x: init_x,
    //         y: init_y,
    //         color: col,
    //         moves: 0,
    //         next_move_time: init.duration,
    //         sched: o,
    //     }
    // });
//
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
        .attr("r", function(d) { return particleRadius; })
        .style("fill", function(d) { return '#eee'; });

    var intervalId = window.setInterval(timer, speed);
    function timer() {
      currTimeMoment = moment(minDate, dateFormat).add(curMinute, 'minutes');
      if (currTimeMoment.isAfter(moment(maxDate, dateFormat))) { // stop timer after last event
          clearInterval(intervalId);
          d3.select("#current_time").text('Finished!');
      } else {
// debugger;
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
// debugger;
            curr_node.cx = x(curr_node.beaconId) + margin.left;
            curr_node.cy = 50;
          });
// debugger;
          force.resume();

          curMinute += 1;
          d3.select("#current_time").text(currTimeMoment.format('dddd h:mma'));
          // console.log('%c[beaconViz.js:116]\nactiveUsers \n(see below): ','font-size:25px;color:teal;'); console.log(activeUsers);
          // console.log('%c[beaconViz.js:125]\nnodes \n(see below): ','font-size:25px;color:steelblue;'); console.log(nodes);
      }
    }

    function tick(e) {
// debugger;
      var k = 0.1 * e.alpha;

      // Push nodes toward their designated focus.
      nodes.forEach(function(o, i) {
// debugger;
          o.x += (x(o.beaconId) - o.x) * k * damper;
          o.y += (50 - o.y) * k * damper;
      });

      circle
          .each(collide(.5))
          .style("fill", function(d) { return "#eee"; })
          .attr("id", function(d) { return d.attendeeId; })
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
//     // Update nodes based on activity and duration
//     function timer() {
//         d3.range(nodes.length).map(function(i) {
//             var curr_node = nodes[i],
//                 curr_moves = curr_node.moves;
//
//             // Time to go to next activity
//             if (curr_node.next_move_time == curr_minute) {
//                 if (curr_node.moves == curr_node.sched.length-1) {
//                     curr_moves = 0;
//                 } else {
//                     curr_moves += 1;
//                 }
//
//                 // Keep track of working and not working
//                 if (curr_node.act == "w" && curr_node.sched[ curr_moves ].act == "o") {
//                     occ_names[curr_node.grp].count -= 1;
//                 } else if (curr_node.act == "o" && curr_node.sched[ curr_moves ].act == "w") {
//                     occ_names[curr_node.grp].count += 1;
//                 }
//
//                 // Move on to next activity
//                 curr_node.act = curr_node.sched[ curr_moves ].act;
//                 curr_node.where = curr_node.sched[ curr_moves ].where;
//
//                 // Add to new activity count
//                 // act_counts[curr_node.act] += 1;
//
//                 curr_node.moves = curr_moves;
//                 curr_node.cx = x(curr_node.grp);
//                 curr_node.cy = y(curr_node.where);
//
//                 nodes[i].next_move_time += nodes[i].sched[ curr_node.moves ].duration;
//             }
//
//         });
// console.log('nodes', nodes);
//         force.resume();
//         curr_minute += 1;
//
//         // Update time
//         var true_minute = curr_minute % 1440;
//         d3.select("#current_time").text(minutesToTime(true_minute));
//
//         setTimeout(timer, 180);
//     }
//     setTimeout(timer, 180);
//
//
//     function tick(e) {
//         var k = 0.1 * e.alpha;
//
//         // Push nodes toward their designated focus.
//         nodes.forEach(function(o, i) {
//             var curr_act = o.act;
//
//             if (curr_act == "w") {
//                 o.color = colorByOcc(o.grp);
//             } else {
//                 o.color = "#cccccc";
//             }
//             o.x += (x(o.grp) - o.x) * k * damper;
//             o.y += (y(o.where) - o.y) * k * damper;
//         });
//
//         circle
//             .each(collide(.5))
//             .style("fill", function(d) { return d.color; })
//             .attr("cx", function(d) { return d.x; })
//             .attr("cy", function(d) { return d.y; });
//     }
//
//
//     // Resolve collisions between nodes.
//     function collide(alpha) {
//         var quadtree = d3.geom.quadtree(nodes);
//         return function(d) {
//             var r = d.radius + radius + padding,
//                 nx1 = d.x - r,
//                 nx2 = d.x + r,
//                 ny1 = d.y - r,
//                 ny2 = d.y + r;
//             quadtree.visit(function(quad, x1, y1, x2, y2) {
//                 if (quad.point && (quad.point !== d)) {
//                     var x = d.x - quad.point.x,
//                         y = d.y - quad.point.y,
//                         l = Math.sqrt(x * x + y * y),
//                         r = d.radius + quad.point.radius + (d.where !== quad.point.where) * padding;
//                     if (l < r) {
//                         l = (l - r) / l * alpha;
//                         d.x -= x *= l;
//                         d.y -= y *= l;
//                         quad.point.x += x;
//                         quad.point.y += y;
//                     }
//                 }
//                 return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
//             });
//         };
//     }
}); // @end d3.tsv


function colorByOcc(occ) {

    return occ_names[occ].color;
}


function colorByActivity(activity) {

    var color_by_activity = {
        "0": "#e0d400",
        "1": "#1c8af9",
        "2": "#51BC05",
        "3": "#FF7F00",
        "4": "#DB32A4",
        "5": "#00CDF8",
        "6": "#E63B60",
        "7": "#8E5649",
        "8": "#68c99e",
        "9": "#a477c8",
        "10": "#5C76EC",
        "11": "#E773C3",
        "12": "#799fd2",
        "13": "#038a6c",
        "14": "#cc87fa",
        "15": "#ee8e76",
        "16": "#bbbbbb",
    }

    return color_by_activity[activity];

}

// wrap labels and center
function wrap(text, width) {
    text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}


// Minutes to time of day. Data is minutes from 4am.
function minutesToTime(m) {
    var minutes = (m + 4*60) % 1440;
    var hh = Math.floor(minutes / 60);
    var ampm;
    if (hh > 12) {
        hh = hh - 12;
        ampm = "pm";
    } else if (hh == 12) {
        ampm = "pm";
    } else if (hh == 0) {
        hh = 12;
        ampm = "am";
    } else {
        ampm = "am";
    }
    var mm = minutes % 60;
    if (mm < 10) {
        mm = "0" + mm;
    }

    return hh + ":" + mm + ampm
}
