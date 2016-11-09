// Initialize websocket connection
var socket = io.connect('http://din16000602:3000');

//Convert kafka messages arriving in tuples to arrays.
var tupletoArray = function(tuple){
	return tuple.substring(1,tuple.length-1).split(",");
};

//------------------------------------------------------ USER DEMOGRAPHICS -----------------------------------------------
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

// window.setInterval(function(){
// 	socket.emit('fetch-userData', 'select age, gender from user_details;');
// },2500);

socket.on('fetched-userData', function(arr){
	userDemographicsChartData = arr;
	console.log(userDemographicsChartData);
	userDemographicsChart.update();
});

//-------------------------------------------------------------------LATENCY------------------------------------------------
var warningSum = 0, totalUsersSum = 0, userDemographicsSum = 0, salesSum = 0;
var warningCount = 0,
	totalUsersCount = 0,
	userDemographicsCount = 0,
	salesSumCount = 0;

var warningDiff = 0,
	totalUsersDiff =0,
	userDemographicsDiff = 0,
	salesSumDiff = 0;

var latencyChart;
var latencyChartData = [{key: "warning", values: []}, {key: "totalUsers", values: []}, {key: "userDemographicsSum", values: []}, {key: "salesSum", values: []}];
nv.addGraph(function() {
		latencyChart = nv.models.lineChart().duration(750)
			.useInteractiveGuideline(true);

		latencyChart.xAxis
		  .axisLabel("Timestamp")
		  .showMaxMin(true)
		  .tickFormat(function(d){ return d3.time.format("%X")(new Date(d));});

		latencyChart.yAxis
			  .axisLabel("Latency")
		  .tickFormat(d3.format(',.1f'));

		d3.select('#queryLatency')
				.append('svg')
		  .datum(latencyChartData)
		 .call(latencyChart);

		nv.utils.windowResize(latencyChart.update());
		return latencyChart;
});


//--------------------------------------------------------------------SALES OF DEVICES------------------------------------
var salesChart;
var salesChartData = [{key: "Actual Sales", values: []}];
nv.addGraph(function() {
		salesChart = nv.models.multiBarChart();

		salesChart.xAxis
		  .axisLabel("Timestamp")
		  .showMaxMin(true);
		  // .tickFormat(function(d){ return d3.time.format("%X")(new Date(d));});

		salesChart.yAxis
			  .axisLabel("Count")
		  .tickFormat(d3.format(',.1f'));

		d3.select('#fitbitSale')
				.append('svg')
		  .datum(salesChartData)
		 .call(salesChart);

		nv.utils.windowResize(salesChart.update());
		return salesChart;
});

window.setInterval(function(){
	socket.emit('fetch-salesData', 'select * from sales;');
},2500);

socket.on('fetched-salesData', function(sales){
	var count = 1;
	salesChartData = [{key: "Actual Sales", values: []}];
	sales.forEach(function(sale){
		salesChartData[0].values.push({x: sale[1], y: +sale[1]});
		console.log(sale);
		count++;
	});
	console.log(salesChartData);
	salesChart.update();
});

//--------------------------------------------------------WARNING NOTIFICATION----------------------------------------------
socket.on('warningNotification',function(msg){
	var data = tupletoArray(msg);
	warningDiff = Date.now() - Number(data[2]);
	warningSum += warningDiff;
	warningCount++;
	salesChartData[0].values.push({x: Date.now(), y: warningSum/warningCount});
	salesChart.update();

	if(data[1] === "simple") {
		$('<span></span>').addClass('white-text').text(`${data[0]}`).appendTo(('<div></div>').addClass('card-panel orange darken-1').prependTo('#warnings'));
	} else	{
		$('<span></span>').addClass('white-text').text(`${data[0]}`).appendTo(('<div></div>').addClass('card-panel red').prependTo('#warnings'));
	}

});


// ---------------------------------------- FETCH USER DATA FROM CASSANDRA -----------------------------------------
socket.on('fetched-warningUserData', function(result){
	// $('<span></span>').addClass('row').text(`USER ID: ${result.user_id}`).appendTo('#warningDetails');
	$('#userID').text(result.user_id);
	$('#age').text(result.age);
	$('#bfp').text(result.bfp);
	$('#bmi').text(result.bmi);
	$('#bp').text(result.bp_cat);
	$('#dia').text(result.bp_dia);
	$('#sys').text(result.bp_sys);
	$('#act').text(result.category);
	$('#gender').text(result.gender);
	$('#height').text(result.height);
	$('#weight').text(result.weight);

});

// ---------------------------------------------Warning map initialization----------------------------------------------------------
var warningMap = L.map('warningLocation').setView([37.3541, -121.9552], 15);
L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(warningMap);
var warningLayer = new L.featureGroup();

socket.on('fetched-warningLocation', function(result){
	warningMap.panTo(new L.LatLng(result.lat, result.long));
	warningLayer.clearLayers();
	L.marker([result.lat, result.long]).addTo(warningLayer);
	warningMap.addLayer(warningLayer);
});


//----------------------------------------------- TOTAL USERS ------------------------------------------------------
socket.on('user-list-length', function(total){
	$('#totalUsers').text(total);
});

//---------------------------------------------------- JQUERY ------------------------------------------------------
$(document).ready(function() {

	$('#warnings').on("click", "div.card-panel" ,function(){
		socket.emit('fetch-warningUserData', `select * from user_details where user_id='${$(this).text().trim()}';`);
		socket.emit('fetch-warningLocation', `select * from latest_location where user_id='${$(this).text().trim()}';`);
	});

});// jQuery end

