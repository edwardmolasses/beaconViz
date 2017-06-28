var browserWidth = document.body.clientWidth;
var margin = {top: 105, right: 50, bottom: 50, left: 145 };
var width = browserWidth - margin.left - margin.right;
var height = 450 - margin.top - margin.bottom;
var beaconList = [];
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
var minDate;
var maxDate;
var dateFormat = 'YYYY-MM-DD HH:mm';
var regularSpeed = 100;
var speed = regularSpeed;
var curMinute = 0;
var currTimeMoment;
var activeUsers = [];
var nodes = [];

d3.csv("data/qm_beacons.csv", function(error, data) {

    //                             _       _
    //  _ __  _ __ ___ _ __     __| | __ _| |_ __ _
    // | '_ \| '__/ _ | '_ \   / _` |/ _` | __/ _` |
    // | |_) | | |  __| |_) | | (_| | (_| | || (_| |
    // | .__/|_|  \___| .__/   \__,_|\__,_|\__\__,_|
    // |_|            |_|

    maxDate = minDate = fixYear(data[0]['Date']);
    data.forEach(function(item, index) {
        buildBeaconListItem(beaconList, item);
        if (item['Date']) {
            item['Date'] = fixYear(item['Date']);
            minDate = moment.min(moment(minDate, dateFormat), moment(item['Date'], dateFormat)).format(dateFormat);
            maxDate = moment.max(moment(maxDate, dateFormat), moment(item['Date'], dateFormat)).format(dateFormat);
        }
        data[index]['Date'] = item['Date'];
        data[index]['Attendee ID'] = 'ID' + item['Attendee ID'];
    });
    console.log('%c[beaconViz.js:52]\ndata \n(see below): ','font-size:25px;color:tomato;'); console.log(data);

    //  _ __ ___   __ _ _ __
    // | '_ ` _ \ / _` | '_ \
    // | | | | | | (_| | |_) |
    // |_| |_| |_|\__,_| .__/
    //                 |_|

    var tick = function(e) {
        return;
    };
    var force = d3.layout.force()
        .nodes(nodes)
        .size([width, height])
        .gravity(0)
        .charge(0)
        .friction(.9)
        .on("tick", tick)
        .start();

   // create the scale we will use for the axis
   var axisScale = d3.scale.ordinal()
                    .domain(Object.keys(beaconList))
                    .rangePoints([0, width - (margin.left + margin.right)]);

   // create the axis
   var xAxis = d3.svg.axis()
                    .scale(axisScale)
                    .tickFormat(function(d) {
                        return beaconList[d]['id'];
                    });

    //       _            _
    //   ___| | ___   ___| | __
    //  / __| |/ _ \ / __| |/ /
    // | (__| | (_) | (__|   <
    //  \___|_|\___/ \___|_|\_\

    var pushActiveUser = function(userObj) {
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
    var populateNodes = function(userList) {
        nodes = [];
        for (var key in userList) {
            if (!userList.hasOwnProperty(key)) continue;
            nodes.push(userList[key]);
        }
    }
    var intervalId = window.setInterval(timer, speed);
    function timer() {
        currTimeMoment = moment(minDate, dateFormat).add(curMinute, 'minutes');
        if (currTimeMoment.isAfter(moment(maxDate, dateFormat))) {
            clearInterval(intervalId);
            d3.select("#current_time").text('Finished!');
        } else {
            curMinute += 1;
            d3.select("#current_time").text(currTimeMoment.format('dddd h:mma'));
            data.forEach(function(item) {
                if (moment(item['Date'], dateFormat).isSame(currTimeMoment)) {
                    if (item['Attendee ID']) {
                        pushActiveUser(item);
                    }
                }
            });
            populateNodes(activeUsers);
            console.log('%c[beaconViz.js:116]\nactiveUsers \n(see below): ','font-size:25px;color:teal;'); console.log(activeUsers);
            console.log('%c[beaconViz.js:125]\nnodes \n(see below): ','font-size:25px;color:steelblue;'); console.log(nodes);
        }
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

});
