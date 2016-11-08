// Initialize websocket connection
var socket = io.connect('http://localhost:3000');

//Convert kafka messages arriving in tuples to arrays.
var tupletoArray = function(tuple){
	return arr = tuple.substring(1,tuple.length-1).split(",");
};

var userDemographicsChart;
var userDemographicsChartData =  [{"key":"Male","color":"#2196f3","values":[{"x":5,"y":0},{"x":6,"y":0},{"x":7,"y":0},{"x":8,"y":0},{"x":9,"y":0},{"x":10,"y":0},{"x":11,"y":0},{"x":12,"y":0},{"x":13,"y":0},{"x":14,"y":0},{"x":15,"y":0},{"x":16,"y":0},{"x":17,"y":0},{"x":18,"y":0},{"x":19,"y":0},{"x":20,"y":0},{"x":21,"y":0},{"x":22,"y":0},{"x":23,"y":0},{"x":24,"y":0},{"x":25,"y":0},{"x":26,"y":0},{"x":27,"y":0},{"x":28,"y":0},{"x":29,"y":0},{"x":30,"y":0},{"x":31,"y":0},{"x":32,"y":0},{"x":33,"y":0},{"x":34,"y":0},{"x":35,"y":0},{"x":36,"y":0},{"x":37,"y":0},{"x":38,"y":0},{"x":39,"y":0},{"x":40,"y":0},{"x":41,"y":0},{"x":42,"y":0},{"x":43,"y":0},{"x":44,"y":0},{"x":45,"y":0},{"x":46,"y":0},{"x":47,"y":0},{"x":48,"y":0},{"x":49,"y":0},{"x":50,"y":0},{"x":51,"y":0},{"x":52,"y":0},{"x":53,"y":0},{"x":54,"y":0},{"x":55,"y":0},{"x":56,"y":0},{"x":57,"y":0},{"x":58,"y":0},{"x":59,"y":0},{"x":60,"y":0},{"x":61,"y":0},{"x":62,"y":0},{"x":63,"y":0},{"x":64,"y":0},{"x":65,"y":0},{"x":66,"y":0},{"x":67,"y":0},{"x":68,"y":0},{"x":69,"y":0},{"x":70,"y":0}]},{"key":"Female","color":"#e91e63","values":[{"x":5,"y":0},{"x":6,"y":0},{"x":7,"y":0},{"x":8,"y":0},{"x":9,"y":0},{"x":10,"y":0},{"x":11,"y":0},{"x":12,"y":0},{"x":13,"y":0},{"x":14,"y":0},{"x":15,"y":0},{"x":16,"y":0},{"x":17,"y":0},{"x":18,"y":0},{"x":19,"y":0},{"x":20,"y":0},{"x":21,"y":0},{"x":22,"y":0},{"x":23,"y":0},{"x":24,"y":0},{"x":25,"y":0},{"x":26,"y":0},{"x":27,"y":0},{"x":28,"y":0},{"x":29,"y":0},{"x":30,"y":0},{"x":31,"y":0},{"x":32,"y":0},{"x":33,"y":0},{"x":34,"y":0},{"x":35,"y":0},{"x":36,"y":0},{"x":37,"y":0},{"x":38,"y":0},{"x":39,"y":0},{"x":40,"y":0},{"x":41,"y":0},{"x":42,"y":0},{"x":43,"y":0},{"x":44,"y":0},{"x":45,"y":0},{"x":46,"y":0},{"x":47,"y":0},{"x":48,"y":0},{"x":49,"y":0},{"x":50,"y":0},{"x":51,"y":0},{"x":52,"y":0},{"x":53,"y":0},{"x":54,"y":0},{"x":55,"y":0},{"x":56,"y":0},{"x":57,"y":0},{"x":58,"y":0},{"x":59,"y":0},{"x":60,"y":0},{"x":61,"y":0},{"x":62,"y":0},{"x":63,"y":0},{"x":64,"y":0},{"x":65,"y":0},{"x":66,"y":0},{"x":67,"y":0},{"x":68,"y":0},{"x":69,"y":0},{"x":70,"y":0}]}];
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

$('#updateBarChart').click(function(event) {
	userDemographicsChartData[0].values = [];
	userDemographicsChartData[1].values = [];
	for(var i = 5; i <= 70; i++){
		userDemographicsChartData[0].values.push({x: i, y: Math.random()});
		userDemographicsChartData[1].values.push({x: i, y: Math.random()});
	}
	userDemographicsChart.update();
});

var salesChart;
var salesChartData = [{key: "Fitbit Sales", values: []}, {key: "Predicted Sales", values: []}];
nv.addGraph(function() {
		salesChart = nv.models.lineChart()
							.duration(750);

		salesChart.xAxis
		  .axisLabel("Timestamp")
		  .showMaxMin(true)
		  .tickFormat(d3.format(',0f'));

		salesChart.yAxis
			  .axisLabel("Sales")
		  .tickFormat(d3.format(',.1f'));

		d3.select('#fitbitSale')
				.append('svg')
		  .datum(salesChartData)
		 .call(salesChart);

		nv.utils.windowResize(salesChart.update());
		return salesChart;
});

var diff, count = 0, sum = 0;
socket.on('warningNotification',function(msg){
	var data = tupletoArray(msg);
	diff = Date.now() - Number(data[2]);
	sum += diff;
	count++;
	salesChartData[0].values.push({x: Date.now(), y: diff});
	salesChartData[1].values.push({x: Date.now(), y: sum/count});
	salesChart.update();
})

