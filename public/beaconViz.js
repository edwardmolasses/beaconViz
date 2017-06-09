d3.csv("data/qm_beacons.csv", function(error, data) {
   console.log('%c[beaconViz.js:4]\ndata \n(see below): ','font-size:25px;color:yellowgreen;'); console.log(data);
   // d3.select('#beaconChart').selectAll('circle')
   //     .data(d3.map(data, function(d){ return d['Beacon ID'] }))
});