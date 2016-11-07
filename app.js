var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var kafka = require('kafka-node');
var cassandra = require('cassandra-driver');

server.listen(3000);

app.use(express.static(__dirname + '/view'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});


// Kafka Consumer Config
// var zkserver = 'din16000309:2181'; // Kafka Server Address
// var kafka_client_id = 'healthcare-dashboard';
// var kafkaClient = new kafka.Client(zkserver,kafka_client_id);
// var topics = [
// 	{ topic: 'bounceRate' },
// 	{ topic: 'averageTime' },
// 	{ topic: 'usersPerCategory' },
// 	{ topic: 'hitsByMarketingChannels' },
// 	{ topic: 'pagesByBounceRate' }
// ];
// var consumer = new kafka.Consumer(kafkaClient,topics,{autoCommit: true});

// // Kafka consumer action definitions
// consumer.on('message', function (message) {
// 	// console.log(message.topic + " ->> " + message.value);
// 	io.emit(message.topic, message.value); // Reading Kafka topic value and Kafka message
// });

// //cassandra configurations
// var client = new cassandra.Client({contactPoints: ['DIN16000309'], keyspace: 'iot'});

// Define action to take when a websocket connection is established
io.on('connection', function (socket) {
	console.log("A client is connected.");
});
