var margin = {top: 105, right: 50, bottom: 50, left: 145 };
var width = 1800 - margin.left - margin.right;
var height = 450 - margin.top - margin.bottom;
var beacons = [];
var buildBeaconList = function(data) {
   data.forEach(function(item) {
      beacons[item['Beacon ID']] = {
         id: item['Beacon ID'],
         name: item['Beacon Name'],
         major: item['Major Number'],
         minor: item['Minor Number']
      };
   });
};

d3.csv("data/qm_beacons.csv", function(error, data) {
   // console.log('%c[beaconViz.js:4]\ndata \n(see below): ','font-size:25px;color:yellowgreen;'); console.log(data);

   //                                         _       _
   //  _ __  _ __ ___   ___ ___ ___ ___    __| | __ _| |_ __ _
   // | '_ \| '__/ _ \ / __/ _ / __/ __|  / _` |/ _` | __/ _` |
   // | |_) | | | (_) | (_|  __\__ \__ \ | (_| | (_| | || (_| |
   // | .__/|_|  \___/ \___\___|___|___/  \__,_|\__,_|\__\__,_|
   // |_|

   buildBeaconList(data);
   // console.log('%c[beaconViz.js:17]\nbeacons[0][id] \n(see below): ','font-size:25px;color:thistle;'); console.log(beacons['Beacon1']['id']);

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
                                       .attr("width", width + margin.left + margin.right)
                                       .attr("height", height);

   //Create the Scale we will use for the Axis
   var axisScale = d3.scale.ordinal()
                           .domain(Object.keys(beacons))
                           .rangePoints([0, width]);

   //Create the Axis
   var xAxis = d3.svg.axis()
                  .scale(axisScale)
                  .tickFormat(function(d) {
                     return beacons[d]['id'];
                  });


   //Create an SVG group Element for the Axis elements and call the xAxis function
   var xAxisGroup = svgContainer.append("g")
                                 .attr("class", "x axis")
                                 .call(xAxis)
                                 .attr("transform", "translate(" + margin.left + "," + margin.top + ")");;


   console.log('%c[beaconViz.js:12]\nbeacons \n(see below): ','font-size:25px;color:teal;'); console.log(beacons);
});
