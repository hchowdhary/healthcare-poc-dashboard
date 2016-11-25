var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var kafka = require('kafka-node');
var cassandra = require('cassandra-driver');

server.listen(3000);

app.use(express.static(__dirname + '/view'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});


//Kafka Consumer Config
var zkserver = 'din16000309:2181'; // Kafka Server Address
var kafka_client_id = 'healthcare-dashboard';
var kafkaClient = new kafka.Client(zkserver,kafka_client_id);
var topics = [
	{ topic: 'warningNotification' },
	{ topic: 'user-list-length' }
];
var consumer = new kafka.Consumer(kafkaClient,topics,{autoCommit: true});

// Kafka consumer action definitions
consumer.on('message', function (message) {
	// console.log(message.topic + " ->> " + message.value);
	io.emit(message.topic, message.value); // Reading Kafka topic value and Kafka message
});

//cassandra configurations
var client = new cassandra.Client({contactPoints: ['DIN16000309'], keyspace: 'iot'});

// Define action to take when a websocket connection is established
io.on('connection', function (socket) {
	console.log("A client is connected.");

	// socket.on('fetch-location',function(query){
	// 	client.execute(query, function (err, result) {
	// 		if(err){console.log(err);}
	// 		io.emit('fetched-latest-location', result.rows);
	// 	});
	// });

	socket.on('fetch-warningUserData',function(query){
		client.execute(query, function (err, result) {
			if(err){console.log(err);}
			io.emit('fetched-warningUserData', result.rows[0]);
		});
	});

	socket.on('fetch-warningLocation',function(query){
		client.execute(query, function (err, result) {
			if(err){console.log(err);}
			io.emit('fetched-warningLocation', result.rows[0]);
		});
	});

	socket.on('fetch-userData', function(query){
		var tempArr;
		var userDemographicsValues =  [{"key":"Male","color":"#2196f3","values":[{"x":5,"y":0},{"x":6,"y":0},{"x":7,"y":0},{"x":8,"y":0},{"x":9,"y":0},{"x":10,"y":0},{"x":11,"y":0},{"x":12,"y":0},{"x":13,"y":0},{"x":14,"y":0},{"x":15,"y":0},{"x":16,"y":0},{"x":17,"y":0},{"x":18,"y":0},{"x":19,"y":0},{"x":20,"y":0},{"x":21,"y":0},{"x":22,"y":0},{"x":23,"y":0},{"x":24,"y":0},{"x":25,"y":0},{"x":26,"y":0},{"x":27,"y":0},{"x":28,"y":0},{"x":29,"y":0},{"x":30,"y":0},{"x":31,"y":0},{"x":32,"y":0},{"x":33,"y":0},{"x":34,"y":0},{"x":35,"y":0},{"x":36,"y":0},{"x":37,"y":0},{"x":38,"y":0},{"x":39,"y":0},{"x":40,"y":0},{"x":41,"y":0},{"x":42,"y":0},{"x":43,"y":0},{"x":44,"y":0},{"x":45,"y":0},{"x":46,"y":0},{"x":47,"y":0},{"x":48,"y":0},{"x":49,"y":0},{"x":50,"y":0},{"x":51,"y":0},{"x":52,"y":0},{"x":53,"y":0},{"x":54,"y":0},{"x":55,"y":0},{"x":56,"y":0},{"x":57,"y":0},{"x":58,"y":0},{"x":59,"y":0},{"x":60,"y":0},{"x":61,"y":0},{"x":62,"y":0},{"x":63,"y":0},{"x":64,"y":0},{"x":65,"y":0},{"x":66,"y":0},{"x":67,"y":0},{"x":68,"y":0},{"x":69,"y":0},{"x":70,"y":0}]},{"key":"Female","color":"#e91e63","values":[{"x":5,"y":0},{"x":6,"y":0},{"x":7,"y":0},{"x":8,"y":0},{"x":9,"y":0},{"x":10,"y":0},{"x":11,"y":0},{"x":12,"y":0},{"x":13,"y":0},{"x":14,"y":0},{"x":15,"y":0},{"x":16,"y":0},{"x":17,"y":0},{"x":18,"y":0},{"x":19,"y":0},{"x":20,"y":0},{"x":21,"y":0},{"x":22,"y":0},{"x":23,"y":0},{"x":24,"y":0},{"x":25,"y":0},{"x":26,"y":0},{"x":27,"y":0},{"x":28,"y":0},{"x":29,"y":0},{"x":30,"y":0},{"x":31,"y":0},{"x":32,"y":0},{"x":33,"y":0},{"x":34,"y":0},{"x":35,"y":0},{"x":36,"y":0},{"x":37,"y":0},{"x":38,"y":0},{"x":39,"y":0},{"x":40,"y":0},{"x":41,"y":0},{"x":42,"y":0},{"x":43,"y":0},{"x":44,"y":0},{"x":45,"y":0},{"x":46,"y":0},{"x":47,"y":0},{"x":48,"y":0},{"x":49,"y":0},{"x":50,"y":0},{"x":51,"y":0},{"x":52,"y":0},{"x":53,"y":0},{"x":54,"y":0},{"x":55,"y":0},{"x":56,"y":0},{"x":57,"y":0},{"x":58,"y":0},{"x":59,"y":0},{"x":60,"y":0},{"x":61,"y":0},{"x":62,"y":0},{"x":63,"y":0},{"x":64,"y":0},{"x":65,"y":0},{"x":66,"y":0},{"x":67,"y":0},{"x":68,"y":0},{"x":69,"y":0},{"x":70,"y":0}]}];
		client.execute(query, function (err, result) {
			if(err){console.log(err);}

			result.rows.forEach(function(row){
				// decide which object to operate on with respect to gender
				if(row.gender === "M"){
					tempArr = userDemographicsValues[0].values;
				} else {
					tempArr = userDemographicsValues[1].values;
				}
				// update the count of all objects age wise for the array.
				tempArr.forEach(function(obj){
					if(obj.x === row.age) obj.y++;
				});
			});
			io.emit('fetched-userData', userDemographicsValues);
		});
	});

	socket.on('fetch-salesData', function(query){
		client.execute(query, function (err, result) {
			if(err){console.log(err);}
			io.emit('fetched-salesData', result.rows);
		});
	});

}); //io.on connection end
var counter;
setInterval(function(){
	counter = Date.now();
	console.log(counter);
	client.execute("select * from latest_location", function (err, result) {
		if(err){console.log(err);}
		io.emit('fetched-latest-location', {location: result.rows, time: counter});
	});
},1500);