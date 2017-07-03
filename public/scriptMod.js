var margin = {top: 105, right: 50, bottom: 50, left: 245 },
    width = 1800 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom,
    padding = 3, // some kind of animation parameter for the effect of collision between nodes ???
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
d3.tsv("data/whatwhere.tsv", function(error, data) {

    var x = d3.scale.ordinal()
    .rangePoints([0, width]);
    var xAxis = d3.svg.axis()
    .scale(x)
    .tickFormat(function(d) {
      return occ_names[d]['name'];
    })
    .orient("top");

    var y = d3.scale.ordinal()
    .domain(Object.keys(act_codes))
    .rangePoints([0, height]);
    var yAxis = d3.svg.axis()
    .scale(y)
    .tickSize(40)
    .tickFormat(function(d) {
      console.log(Object.keys(act_codes));
      return act_codes[d]['desc'];
    })
    .orient("left");


    // Start the SVG
    var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    //
    // Axes (note: placing the text labels on x and y axes)
    //
    x.domain(d3.map(data, function(d) { return d.grp; }).keys());
    // note: first place the location labels on y
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(-70,-10)")
        .call(yAxis)
        .selectAll(".tick text")
        .call(wrap, 80);
    // note: then place the work type labels on x
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0,-100)")
        .call(xAxis)
        .selectAll(".tick text")
        .call(wrap, x.rangeBand());

    //
    // Store data
    //
    data.forEach(function(d) {
        var day_array = d.day.split(",");
        var activities = [];
        for (var i=0; i < day_array.length; i++) {
            // Duration
            if (i % 2 == 1) {
                activities.push({
                    'grp': d.grp,
                    'act': day_array[i-1].substring(1),
                    'where': day_array[i-1].substring(0, 1),
                    'duration': +day_array[i]});
            }
        }
        sched_objs.push(activities);
    });


    // A node for each person's schedule
    var nodes = sched_objs.map(function(o,i) {
        // debugger;
        var init = o[0];
        var init_x = x(init.grp) + Math.random();
        // add some randomization to the placement of the node in relation to exact .grp location on ordinal scale x-axis
        var init_y = y(init.where) + Math.random();
        if (init.act == "w") {
            colorByOcc(init.grp)
            occ_names[init.grp].count += 1;
        } else {
            var col = "#cccccc";
        }
        return {
            grp: init.grp,
            act: init.act,
            where: init.where,
            radius: radius,
            x: init_x,
            y: init_y,
            color: col,
            moves: 0,
            next_move_time: init.duration,
            sched: o,
        }
    });

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
        .style("fill", function(d) { return d.color; });


    // Update nodes based on activity and duration
    function timer() {
        d3.range(nodes.length).map(function(i) {
            var curr_node = nodes[i],
                curr_moves = curr_node.moves;

            // Time to go to next activity
            if (curr_node.next_move_time == curr_minute) {
                if (curr_node.moves == curr_node.sched.length-1) {
                    curr_moves = 0;
                } else {
                    curr_moves += 1;
                }

                // Keep track of working and not working
                if (curr_node.act == "w" && curr_node.sched[ curr_moves ].act == "o") {
                    occ_names[curr_node.grp].count -= 1;
                } else if (curr_node.act == "o" && curr_node.sched[ curr_moves ].act == "w") {
                    occ_names[curr_node.grp].count += 1;
                }

                // Move on to next activity
                curr_node.act = curr_node.sched[ curr_moves ].act;
                curr_node.where = curr_node.sched[ curr_moves ].where;

                // Add to new activity count
                // act_counts[curr_node.act] += 1;

                curr_node.moves = curr_moves;
                curr_node.cx = x(curr_node.grp);
                curr_node.cy = y(curr_node.where);

                nodes[i].next_move_time += nodes[i].sched[ curr_node.moves ].duration;
            }

        });
console.log('nodes', nodes);
        force.resume();
        curr_minute += 1;

        // Update time
        var true_minute = curr_minute % 1440;
        d3.select("#current_time").text(minutesToTime(true_minute));

        setTimeout(timer, 180);
    }
    setTimeout(timer, 180);


    function tick(e) {
        var k = 0.1 * e.alpha;

        // Push nodes toward their designated focus.
        nodes.forEach(function(o, i) {
            var curr_act = o.act;

            if (curr_act == "w") {
                o.color = colorByOcc(o.grp);
            } else {
                o.color = "#cccccc";
            }
            o.x += (x(o.grp) - o.x) * k * damper;
            o.y += (y(o.where) - o.y) * k * damper;
        });

        circle
            .each(collide(.5))
            .style("fill", function(d) { return d.color; })
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
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
