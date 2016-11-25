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
		userDemographicsChart = nv.models.multiBarChart().stacked(true);
		// x axis
		userDemographicsChart.xAxis.axisLabel("Age").tickFormat(d3.format(',0f'));
		// y axis
		userDemographicsChart.yAxis.axisLabel("Count").tickFormat(d3.format(',.0f'));
		// bind data to chart
		d3.select('#userDemographics').append('svg').datum(userDemographicsChartData).call(userDemographicsChart);
		// update chart on resize
		nv.utils.windowResize(userDemographicsChart.update());
		return userDemographicsChart;
});

//periodically poll cassandra to get user details
window.setInterval(function(){
	socket.emit('fetch-userData', 'select age, gender from user_details;');
},3000);

socket.on('fetched-userData', function(arr){
	// as soon as a new msg arrives from the socket update the chart
	d3.select('#userDemographics svg').datum(arr).call(userDemographicsChart);
});

//-------------------------------------------------------------LATENCY------------------------------------------------------
var warningSum = 0, warningCount = 0;
var totalUsersSum = 0,totalUsersCount = 0;
var userLocationSum = 0, userLocationCount = 0;
var activityLevelSum = 0, activityLevelCount = 0;
var currentLocationSum = 0, currentLocationCount = 0;
var userDemographicsSum = 0, userDemographicsSumCount = 0;
// Pipeline 1
var latencyChart1;
var latencyChart1Data = [{key: "Total Users", values: []}];
nv.addGraph(function() {
		latencyChart1 = nv.models.lineChart().duration(750).useInteractiveGuideline(true);
		latencyChart1.xAxis.axisLabel("Timestamp").tickFormat(function(d){ return d3.time.format("%X")(new Date(d));});
		latencyChart1.yAxis.axisLabel("Latency").tickFormat(d3.format(',.2f'));
		d3.select('#pipeline1').append('svg').datum(latencyChart1Data).call(latencyChart1);
		nv.utils.windowResize(latencyChart1.update());
		return latencyChart1;
});

// Pipeline 2
var latencyChart2;
var latencyChart2Data = [{key: "Warning", values: []}];
nv.addGraph(function() {
		latencyChart2 = nv.models.lineChart().duration(750).useInteractiveGuideline(true);
		latencyChart2.xAxis.axisLabel("Timestamp").tickFormat(function(d){ return d3.time.format("%X")(new Date(d));});
		latencyChart2.yAxis.axisLabel("Latency").tickFormat(d3.format(',.2f'));
		d3.select('#pipeline2').append('svg').datum(latencyChart2Data).call(latencyChart2);
		nv.utils.windowResize(latencyChart2.update());
		return latencyChart2;
});

// Pipeline 3
var latencyChart3;
var latencyChart3Data = [{key: "User Location", values: []}];
nv.addGraph(function() {
		latencyChart3 = nv.models.lineChart().duration(750).useInteractiveGuideline(true);
		latencyChart3.xAxis.axisLabel("Timestamp").tickFormat(function(d){ return d3.time.format("%X")(new Date(d));});
		latencyChart3.yAxis.axisLabel("Latency").tickFormat(d3.format(',.2f'));
		d3.select('#pipeline3').append('svg').datum(latencyChart3Data).call(latencyChart3);
		nv.utils.windowResize(latencyChart3.update());
		return latencyChart3;
});

// Pipeline 4
var latencyChart4;
var latencyChart4Data = [{key: "Activity Level", values: []}];
nv.addGraph(function() {
		latencyChart4 = nv.models.lineChart().duration(750).useInteractiveGuideline(true);
		latencyChart4.xAxis.axisLabel("Timestamp").tickFormat(function(d){ return d3.time.format("%X")(new Date(d));});
		latencyChart4.yAxis.axisLabel("Latency").tickFormat(d3.format(',.2f'));
		d3.select('#pipeline4').append('svg').datum(latencyChart1Data).call(latencyChart4);
		nv.utils.windowResize(latencyChart4.update());
		return latencyChart4;
});

// Pipeline 5
var latencyChart5;
var latencyChart5Data = [{key: "Current Location", values: []}];
nv.addGraph(function() {
		latencyChart5 = nv.models.lineChart().duration(750).useInteractiveGuideline(true);
		latencyChart5.xAxis.axisLabel("Timestamp").tickFormat(function(d){ return d3.time.format("%X")(new Date(d));});
		latencyChart5.yAxis.axisLabel("Latency").tickFormat(d3.format(',.2f'));
		d3.select('#pipeline5').append('svg').datum(latencyChart1Data).call(latencyChart5);
		nv.utils.windowResize(latencyChart5.update());
		return latencyChart5;
});

// Pipeline 6
var latencyChart6;
var latencyChart6Data = [{key: "User Demographics", values: []}];
nv.addGraph(function() {
		latencyChart6 = nv.models.lineChart().duration(750).useInteractiveGuideline(true);
		latencyChart6.xAxis.axisLabel("Timestamp").tickFormat(function(d){ return d3.time.format("%X")(new Date(d));});
		latencyChart6.yAxis.axisLabel("Latency").tickFormat(d3.format(',.2f'));
		d3.select('#pipeline6').append('svg').datum(latencyChart6Data).call(latencyChart6);
		nv.utils.windowResize(latencyChart6.update());
		return latencyChart6;
});

//--------------------------------------------------------------------SALES OF DEVICES------------------------------------
var salesChart;
var salesChartData = [{key: "Actual Sales", values: []}];
nv.addGraph(function() {
	salesChart = nv.models.multiBarChart().showControls(false); //shwocontrols false to remove the switch 
	salesChart.xAxis.axisLabel("Timestamp").tickFormat(d3.time.format("%d %b"));
	salesChart.yAxis.axisLabel("Count").tickFormat(d3.format(',.1f'));
	d3.select('#fitbitSale').append('svg').datum(salesChartData).call(salesChart);
	nv.utils.windowResize(salesChart.update());
	return salesChart;
});

window.setInterval(function(){
	socket.emit('fetch-salesData', 'select * from sales;');
},5000);
// parse date function
var	parseDate = d3.time.format("%Y-%m-%d").parse;
socket.on('fetched-salesData', function(sales){
	var i = 0;
	var prePopulated = 0;
	salesChartData = [{key: "Actual Sales", values: []}];
	sales.forEach(function(obj){
		obj.date = parseDate(obj.date);
	});
	sales.sort(function(a,b){
		return a.date - b.date;
	});
	sales.forEach(function(sale){
		if ( i === 0 ) { sale.count = sale.count - prePopulated;}; // sunbtract the pre-populated number from count
		salesChartData[0].values.push({x: sale.date, y: +sale.count});
		i++;
	});
	//update chart with new data
	d3.select('#fitbitSale svg').datum(salesChartData).call(salesChart);
});

//--------------------------------------------------------WARNING NOTIFICATION----------------------------------------------
socket.on('warningNotification',function(msg){
	var data = tupletoArray(msg);
	warningSum += Date.now() - Number(data[2]);
	warningCount++;
	latencyChart2Data[0].values.push({x: Date.now(), y: warningSum/warningCount});
	latencyChart2.update();
	$('#pipeline2-span').text(Math.round(warningSum/warningCount*100)/100);
	if(data[1] === "simple") {
		$('<span></span>').addClass('white-text').text(`${data[0]}`).appendTo($('<div></div>').addClass('card-panel orange darken-1').prependTo('#warnings'));
	} else	{
		$('<span></span>').addClass('white-text').text(`${data[0]}`).appendTo($('<div></div>').addClass('card-panel red').prependTo('#warnings'));
	}

});


// ---------------------------------------- FETCH USER DATA FROM CASSANDRA -----------------------------------------
socket.on('fetched-warningUserData', function(result){
	$('#userID').text(result.user_id.substring(0,16));
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
	var data = tupletoArray(total);
	totalUsersSum += Date.now() - Number(data[1]);
	totalUsersCount++;	
	latencyChart1Data[0].values.push({x: Date.now(), y: totalUsersSum/totalUsersCount});
	latencyChart1.update();
	$('#pipeline1-span').text(Math.round(totalUsersSum/totalUsersCount*100)/100);
	$('#totalUsers').text(totalUsersCount);
});

//---------------------------------------------------- JQUERY ------------------------------------------------------
$(document).ready(function() {

	$('#warnings').on("click", "div.card-panel" ,function(){
		socket.emit('fetch-warningUserData', `select * from user_details where user_id='${$(this).text().trim()}';`);
		socket.emit('fetch-warningLocation', `select * from latest_location where user_id='${$(this).text().trim()}';`);
	});

});// jQuery end

