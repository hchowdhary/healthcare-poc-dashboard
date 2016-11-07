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
	  userDemographicsChart = nv.models.multiBarChart();

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

$('#updateData').click(function(event) {
	userDemographicsChartData[0].values = [];
	userDemographicsChartData[1].values = [];
	for(var i = 5; i <= 70; i++){
		userDemographicsChartData[0].values.push({x: i, y: Math.random()});
		userDemographicsChartData[1].values.push({x: i, y: Math.random()});
	}
	userDemographicsChart.update();
});