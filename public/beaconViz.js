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
var itemMoment;

d3.csv("data/qm_beacons.csv", function(error, data) {
   console.log('%c[beaconViz.js:4]\ndata \n(see below): ','font-size:25px;color:yellowgreen;'); console.log(data);

   //                                         _       _
   //  _ __  _ __ ___   ___ ___ ___ ___    __| | __ _| |_ __ _
   // | '_ \| '__/ _ \ / __/ _ / __/ __|  / _` |/ _` | __/ _` |
   // | |_) | | | (_) | (_|  __\__ \__ \ | (_| | (_| | || (_| |
   // | .__/|_|  \___/ \___\___|___|___/  \__,_|\__,_|\__\__,_|
   // |_|

   data.forEach(function(item, index) {
      buildBeaconListItem(beaconList, item);
      data[index]['Date'] = item['Date'] = '20' +
          item['Date'].split(' ')[0].split('-')[0] +
          '-' +
          item['Date'].split(' ')[0].split('-')[1] +
          '-' +
          item['Date'].split(' ')[0].split('-')[2] +
          ' ' +
          item['Date'].split(' ')[1];
      itemMoment = moment(data[index]['Date']);
      console.log('%c[beaconViz.js:30]\ntime \n(see below): ','font-size:25px;color:thistle;'); console.log(itemMoment.hour() + 'h ' + itemMoment.minute() + 'm');
   });
   // console.log('%c[beaconViz.js:39]\nbeaconList \n(see below): ','font-size:25px;color:yellowgreen;'); console.log(beaconList);
   
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
