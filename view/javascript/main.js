// Initialize websocket connection
var socket = io.connect('http://localhost:3000');

var userDemographicsChart;
var userDemographicsChartData = [
	{
		key: "Male",
		color: "#2196f3",
		values: []
	},
	{
		key: "Female",
		color: "#e91e63",
		values: []
	}
];
nv.addGraph(function() {
	  userDemographicsChart = nv.models.multiBarChart()
	    						// .margin({bottom: 100})
	    						.showControls(true)
	    ;

	  userDemographicsChart.multibar
	    .hideable(true);

	  userDemographicsChart.xAxis
	      .axisLabel("Age")
	      .showMaxMin(true)
	      .tickFormat(d3.format(',0f'));

	  userDemographicsChart.yAxis
	  	  .axisLabel("Count")
	      .tickFormat(d3.format(',.1f'));

	  d3.select('#userDemographics')
	 		.append('svg')
	      .datum(userDemographicsChartData)
	     .call(userDemographicsChart);

	  nv.utils.windowResize(userDemographicsChart.update());
	  return userDemographicsChart;
});
