var margin = {top: 105, right: 50, bottom: 50, left: 145 };
var browserWidth = document.body.clientWidth;
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
var curr_minute = 0;

d3.csv("data/qm_beacons.csv", function(error, data) {
   //                                         _       _
   //  _ __  _ __ ___   ___ ___ ___ ___    __| | __ _| |_ __ _
   // | '_ \| '__/ _ \ / __/ _ / __/ __|  / _` |/ _` | __/ _` |
   // | |_) | | | (_) | (_|  __\__ \__ \ | (_| | (_| | || (_| |
   // | .__/|_|  \___/ \___\___|___|___/  \__,_|\__,_|\__\__,_|
   // |_|
    maxDate = minDate = fixYear(data[0]['Date']);
    data.forEach(function(item, index) {
        buildBeaconListItem(beaconList, item);
        if (item['Date']) {
            item['Date'] = fixYear(item['Date']);
            minDate = moment.min(moment(minDate, dateFormat), moment(item['Date'], dateFormat)).format(dateFormat);
            maxDate = moment.max(moment(maxDate, dateFormat), moment(item['Date'], dateFormat)).format(dateFormat);
        }
        data[index]['Date'] = item['Date'];
    });

    function timer() {
        if (moment(minDate, dateFormat).add(curr_minute, 'minutes').isAfter(moment(maxDate, dateFormat))) {
            curr_minute = 0;
        } else {
            curr_minute += 1;
        }
        d3.select("#current_time").text(moment(minDate, dateFormat).add(curr_minute, 'minutes').format('dddd h:mma'));
        setTimeout(timer, speed);
    }
    setTimeout(timer, speed);

   // var x = d3.scale.ordinal()
   //     .domain(Object.keys(beacons))
   //     .rangePoints([0, width]);
   // var xAxis = d3.svg.axis()
   //     .scale(x)
   //     .tickFormat(function(d) {
   //        return beacons[d]['id'];
   //     })
   //     .orient("top");
   //
   // // Start the SVG
   // var svg = d3.select("#chart").append("svg")
   //     .attr("width", 2000)
   //     .attr("height", height + margin.top + margin.bottom)
   //     .append("g")
   //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
   //
   // svg.append("g")
   //     .attr("class", "x axis")
   //     .attr("transform", "translate(0,-100)")
   //     .call(xAxis);


   //                     _
   //  _ __ ___ _ __   __| | ___ _ __
   // | '__/ _ | '_ \ / _` |/ _ | '__|
   // | | |  __| | | | (_| |  __| |
   // |_|  \___|_| |_|\__,_|\___|_|

   //Create the SVG Viewport
   var svgContainer = d3.select("body").append("svg")
                                       .attr("width", width)
                                       .attr("height", height);

   //Create the Scale we will use for the Axis
   var axisScale = d3.scale.ordinal()
                           .domain(Object.keys(beaconList))
                           .rangePoints([0, width - (margin.left + margin.right)]);

   //Create the Axis
   var xAxis = d3.svg.axis()
                  .scale(axisScale)
                  .tickFormat(function(d) {
                     return beaconList[d]['id'];
                  });

   //Create an SVG group Element for the Axis elements and call the xAxis function
   var xAxisLabel2y = margin.top + 10;
   var xAxisGroup = svgContainer.append("g")
                                 .attr("class", "x axis")
                                 .call(xAxis)
                                 .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

});
