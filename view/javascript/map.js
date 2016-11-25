var mymap = L.map('userLocation').setView([37.3341, -121.9552], 12);
L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);

var markerProperties = {
    color: 'none',
    fillColor: '#D0021B',
    fillOpacity: 0.5,
    radius: 180
};
var query = "select * from latest_location";
var circleLayer = new L.featureGroup();
var mapLatencyStart;
window.setInterval(function(){
	mapLatencyStart = Date.now();
	socket.emit('fetch-location', query);
},1500);

socket.on('fetched-latest-location',function(location){
	circleLayer.clearLayers();
	location.forEach(function(elem){
		L.circle([elem.lat, elem.long], markerProperties).addTo(circleLayer);
	});
	mymap.addLayer(circleLayer);
	userLocationSum += Date.now() - mapLatencyStart;
	userLocationCount++;
	latencyChart3Data[0].values.push({x: Date.now(), y: userLocationSum/userLocationCount});
	latencyChart3.update();
	$('#pipeline3-span').text(Math.round(userLocationSum/userLocationCount*100)/100);
});