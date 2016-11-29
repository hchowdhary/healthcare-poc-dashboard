// Initialize websocket connection
var socket = io.connect('http://din16000602:3000');


//------------------------------------------------------ USER DEMOGRAPHICS -----------------------------------------------
var userDemographicsChart;
var userDemographicsChartData =  [{"key":"Male","color":"#2196f3","values":[]},{"key":"Female","color":"#e91e63","values":[]}];
nv.addGraph(function() {
		userDemographicsChart = nv.models.multiBarChart().stacked(true);
		userDemographicsChart.xAxis.axisLabel("Age").tickFormat(d3.format(',0f'));
		userDemographicsChart.yAxis.axisLabel("Count").tickFormat(d3.format(',.0f'));
		d3.select('#userDemographics').append('svg').datum(userDemographicsChartData).call(userDemographicsChart);
		nv.utils.windowResize(userDemographicsChart.update());
		return userDemographicsChart;
});

socket.on('fetched-userData', function(arr){
	// as soon as a new msg arrives from the socket update the chart
	d3.select('#userDemographics svg').datum(arr).call(userDemographicsChart);
	// userDemographicsSum += Date.now() - userDemographicsStart;
	// userDemographicsCount++;	
	// latencyChart6Data[0].values.push({x: Date.now(), y: userDemographicsSum/userDemographicsCount});
	// latencyChart6.update();
	// $('#pipeline6-span').text(Math.round(userDemographicsSum/userDemographicsCount*100)/100);

});

//-------------------------------------------------------------LATENCY------------------------------------------------------
// Pipeline 1
var latencyChart1;
var latencyChart1Data = [{key: "Total Users", values: []}];
nv.addGraph(function() {
		latencyChart1 = nv.models.lineChart().duration(750).useInteractiveGuideline(true).margin({right:40});
		latencyChart1.xAxis.axisLabel("Timestamp").tickFormat(function(d){ return d3.time.format("%X")(new Date(d));});
		latencyChart1.yAxis.axisLabel("Latency").tickFormat(d3.format(',.2f'));
		d3.select('#pipeline1').append('svg').datum(latencyChart1Data).call(latencyChart1);
		nv.utils.windowResize(latencyChart1.update());
		return latencyChart1;
});

socket.on("update-totalUsersLatency",function(arr){
	console.log(arr);
	latencyChart1Data[0].values = JSON.parse(JSON.stringify(arr.actual));
	latencyChart1.update();
	$('#pipeline1-span').text(arr.avg);
});

// Pipeline 2
var latencyChart2;
var latencyChart2Data = [{key: "Warning", values: []}];
nv.addGraph(function() {
		latencyChart2 = nv.models.lineChart().duration(750).useInteractiveGuideline(true).margin({right:40});
		latencyChart2.xAxis.axisLabel("Timestamp").tickFormat(function(d){ return d3.time.format("%X")(new Date(d));});
		latencyChart2.yAxis.axisLabel("Latency").tickFormat(d3.format(',.2f'));
		d3.select('#pipeline2').append('svg').datum(latencyChart2Data).call(latencyChart2);
		nv.utils.windowResize(latencyChart2.update());
		return latencyChart2;
});

socket.on("update-warningLatency",function(arr){
	console.log(arr.actual);
	latencyChart2Data[0].values = JSON.parse(JSON.stringify(arr.actual));
	latencyChart2.update();
	$('#pipeline2-span').text(arr.avg);
});

// Pipeline 3
var latencyChart3;
var latencyChart3Data = [{key: "POS Data", values: []}];
nv.addGraph(function() {
		latencyChart3 = nv.models.lineChart().duration(750).useInteractiveGuideline(true).margin({right:40});
		latencyChart3.xAxis.axisLabel("Timestamp").tickFormat(function(d){ return d3.time.format("%X")(new Date(d));});
		latencyChart3.yAxis.axisLabel("Latency").tickFormat(d3.format(',.2f'));
		d3.select('#pipeline3').append('svg').datum(latencyChart3Data).call(latencyChart3);
		nv.utils.windowResize(latencyChart3.update());
		return latencyChart3;
});

socket.on("update-posdataLatency", function(arr){
	// console.log(arr);
	latencyChart3Data[0].values = arr.actual;
	latencyChart3.update();
	$('#pipeline3-span').text(arr.avg);
	// console.log(arr.avg);
});

// Pipeline 4
var latencyChart4;
var latencyChart4Data = [{key: "Activity Level", values: []}];
nv.addGraph(function() {
		latencyChart4 = nv.models.lineChart().duration(750).useInteractiveGuideline(true).margin({right:40});
		latencyChart4.xAxis.axisLabel("Timestamp").tickFormat(function(d){ return d3.time.format("%X")(new Date(d));});
		latencyChart4.yAxis.axisLabel("Latency").tickFormat(d3.format(',.2f'));
		d3.select('#pipeline4').append('svg').datum(latencyChart4Data).call(latencyChart4);
		nv.utils.windowResize(latencyChart4.update());
		return latencyChart4;
});

// socket.on("update-userActivityLatency",function(arr){
// 	latencyChart4Data[0].values = arr.acutal;
// 	latencyChart4.update();
// 	$('#pipeline4-span').text(arr.avg);
// });

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
	// console.log("warning : " + msg);
	if(msg.type === "simple") {
		$('<span></span>').addClass('white-text').text(`${msg.userID}`).appendTo($('<div></div>').addClass('card-panel orange darken-1').prependTo('#warnings'));
	} else	{
		$('<span></span>').addClass('white-text').text(`${msg.userID}`).appendTo($('<div></div>').addClass('card-panel red').prependTo('#warnings'));
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

// ---------------------------------------- FETCH USER HR FROM CASSANDRA -----------------------------------------
var userHeartRateChart;
var userHeartRateChartData =  [{key: "Heart Rate", color: "#f44336", values: []}];
nv.addGraph(function() {
		userHeartRateChart = nv.models.lineChart().duration(750).useInteractiveGuideline(true).margin({right:40})
								.x(function(d){return d.time})
								.y(function(d){return d.pulse});
		// userHeartRateChart.tooltip.keyFormatter(function(d){return 26356;});
		userHeartRateChart.xAxis.axisLabel("Timestamp").tickFormat(function(d){ return d3.time.format("%X")(new Date(d));});
		userHeartRateChart.yAxis.axisLabel("Latency").tickFormat(d3.format(',.2f'));
		d3.select('#heartRate').append('svg').datum(userHeartRateChartData).call(userHeartRateChart);
		nv.utils.windowResize(userHeartRateChart.update());
		return userHeartRateChart;
});

socket.on('fetched-hr',function(hr){
	userHeartRateChartData[0].values = hr;
	userHeartRateChart.update();
});

// ---------------------------------------- FETCH USER BODY TEMP FROM CASSANDRA -----------------------------------------
var userBodyTempChart;
var userBodyTempChartData =  [{key: "Body Temp", color: "#ff9800", values: []}];
nv.addGraph(function() {
		userBodyTempChart = nv.models.lineChart().duration(750).useInteractiveGuideline(true).margin({right:40})
								.x(function(d){return d.time})
								.y(function(d){return d.temp});
		userBodyTempChart.xAxis.axisLabel("Timestamp").tickFormat(function(d){ return d3.time.format("%X")(new Date(d));});
		userBodyTempChart.yAxis.axisLabel("Latency").tickFormat(d3.format(',.2f'));
		d3.select('#bodyTemperature').append('svg').datum(userBodyTempChartData).call(userBodyTempChart);
		nv.utils.windowResize(userBodyTempChart.update());
		return userBodyTempChart;
});

socket.on('fetched-bodyTemp',function(bodyTemp){
	userBodyTempChartData[0].values = bodyTemp;
	userBodyTempChart.update();
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
socket.on('user-list-length', function(count){
	// console.log('total users :' + count);

	// var data = tupletoArray(total);
	// totalUsersSum += Date.now() - Number(data[1]);
	// totalUsersCount++;	
	// latencyChart1Data[0].values.push({x: Date.now(), y: totalUsersSum/totalUsersCount});
	// latencyChart1.update();
	// $('#pipeline1-span').text(Math.round(totalUsersSum/totalUsersCount*100)/100);
	$('#totalUsers').text(count);

	// socket.emit('fetch-userData', 'select age, gender from user_details;');
	// userDemographicsStart = Number(data[1]);
});

//---------------------------------------------------- JQUERY ------------------------------------------------------
$(document).ready(function() {

	$('#warnings').on("click", "div.card-panel" ,function(){
		socket.emit('fetch-warningData', `${$(this).text().trim()}`);
	});

});// jQuery end

socket.on("user-activity-category", function(msg){
	// console.log("activity :" + msg);
});