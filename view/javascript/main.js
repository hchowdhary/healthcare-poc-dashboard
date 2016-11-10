// Initialize websocket connection
var socket = io.connect('http://din16000602:3000');

//Convert kafka messages arriving in tuples to arrays.
var tupletoArray = function(tuple){
	return tuple.substring(1,tuple.length-1).split(",");
};

//------------------------------------------------------ USER DEMOGRAPHICS -----------------------------------------------
var userDemographicsChart;
var userDemographicsChartData =  [{"key":"Male","color":"#2196f3","values":[]},{"key":"Female","color":"#e91e63","values":[]}];
nv.addGraph(function() {
		userDemographicsChart = nv.models.multiBarChart();

		userDemographicsChart.xAxis
		  .axisLabel("Age")
		  .showMaxMin(true)
		  .tickFormat(d3.format(',0f'));

		userDemographicsChart.yAxis
			  .axisLabel("Count")
		  .tickFormat(d3.format(',.0f'));

		d3.select('#userDemographics')
				.append('svg')
		  .datum(userDemographicsChartData)
		 .call(userDemographicsChart);

		nv.utils.windowResize(userDemographicsChart.update());
		return userDemographicsChart;
});

window.setInterval(function(){
	socket.emit('fetch-userData', 'select age, gender from user_details;');
},3000);

socket.on('fetched-userData', function(arr){
	d3.select('#userDemographics svg')
		  .datum(arr)
		 .call(userDemographicsChart);
});

//-------------------------------------------------------------------LATENCY------------------------------------------------
var warningSum = 0, totalUsersSum = 0;
var warningCount = 0,
	totalUsersCount = 0;

var warningDiff = 0,
	totalUsersDiff =0;

var latencyChart;
var latencyChartData = [{key: "warning", values: []}, {key: "totalUsers", values: []}];
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
		  .showMaxMin(true)
		  .tickFormat(d3.time.format("%d %b"));

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
},5000);

var	parseDate = d3.time.format("%Y-%m-%d").parse;
socket.on('fetched-salesData', function(sales){
	salesChartData = [{key: "Actual Sales", values: []}];
	sales.forEach(function(sale){
		salesChartData[0].values.push({x: parseDate(sale.date), y: +sale.count});
	});

	d3.select('#fitbitSale svg')
		  .datum(salesChartData)
		 .call(salesChart);
});

//--------------------------------------------------------WARNING NOTIFICATION----------------------------------------------
socket.on('warningNotification',function(msg){
	var data = tupletoArray(msg);
	warningDiff = Date.now() - Number(data[2]);
	warningSum += warningDiff;
	warningCount++;
	latencyChartData[0].values.push({x: Date.now(), y: warningSum/warningCount});
	latencyChart.update();

	if(data[1] === "simple") {
		$('<span></span>').addClass('white-text').text(`${data[0]}`).appendTo($('<div></div>').addClass('card-panel orange darken-1').prependTo('#warnings'));
	} else	{
		$('<span></span>').addClass('white-text').text(`${data[0]}`).appendTo($('<div></div>').addClass('card-panel red').prependTo('#warnings'));
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

