var mymap = L.map('userLocation').setView([37.3541, -121.9552], 11);
L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);

var markerProperties = {
    color: 'none',
    fillColor: '#D0021B',
    fillOpacity: 0.5,
    radius: 30
};
var query = "select * from latest_location";

var circleLayer = new L.featureGroup();

L.circle([37.3524, -121.9520], markerProperties).addTo(circleLayer);
mymap.addLayer(circleLayer);
// window.setInterval(function(){
// 	socket.emit('fetch-location', query);
// 	// console.log('sending query to server');
// },1500);

socket.on('fetched-latest-location',function(location){
	// console.log('received data, updating map');
	circleLayer.clearLayers();
	location.forEach(function(elem){
		L.circle([elem.lat, elem.long], markerProperties).addTo(circleLayer);
	});
	mymap.addLayer(circleLayer);
});