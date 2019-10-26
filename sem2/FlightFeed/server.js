// FlightFeed tool - Grabs flight data from 'opensky-network.org' API and
// parses them into tracks to be consumed by the FTMS UI system.
// Arguments:
//		--unbounded		will grab all available flight data from API.
//						CAUTION: can load 8000+ tracks; server currently cannot handle this well.
//		--store			will enable storing tracks in a local MongoDB collection.
//		--noproduce		will disable tracks being pushed onto a Kafka stream.
// Boundaries, query rate and Kafka topic can be configured in config.json
var request = require('request');
var kafka = require('kafka-node');
var protobuf = require('protobufjs');
var config = require('./config.json');
const argv = require('yargs').argv //Arguments parser

log('Starting setup...');

//API QUERY SETUP
var query = {
	endpoint: 'https://ftmsopensky:ftms2019@opensky-network.org/api',
	operation: '/states/all',
	bounding_box_call: '?lamin=' + config.bounding_box.lower.lat + '&lomin=' + config.bounding_box.lower.long + '&lamax=' + config.bounding_box.upper.lat + '&lomax=' + config.bounding_box.upper.long,
	get call() {
		if(argv.unbounded) {
			return this.endpoint + this.operation;
		}
		return this.endpoint + this.operation + this.bounding_box_call; //Return bounded by default
	}
}
var track_ids = new Map();
var trackId_counter = config.IDs_start;

mongoSetup();
//MONGODB SETUP
var mongoose, Track;
function mongoSetup() {
	if(argv.store) {
		log('Connecting to MongoDB...');
		mongoose = require('mongoose');
		Track = require('./models/track.js');
		mongoose.connect('mongodb://localhost:27017/flights', {useNewUrlParser: true, useUnifiedTopology: true}, err => {
			if(err) throw err;
			log('Connected.');
			kafkaSetup();
		});
	} else {
		kafkaSetup();
	}
}

//KAFKA SETUP
var producer, proto;
function kafkaSetup() {
	if(!argv.noproduce) {
		log('Initialising Kafka producer...');
		var Producer = kafka.Producer;
		var client = new kafka.KafkaClient();
		producer = new Producer(client);

		var topic = {
			topic: config.kafka_topic,
			partitions: 1,
			replicationFactor: 1
		}
		client.createTopics([topic], err => {if(err) throw err;});
		log('Initialised Kafka producer.');

		//PROTOBUF SETUP
		log('Initialising protobuf...');
		producer.on('ready', () => {
			protobuf.load('tdn.proto', function(err, root) {
				if(err) throw err;
				proto = root.lookup('tdn.SystemTrack');
				log('Initialised protobuf.');
				log('Setup complete, beginning feed');
				main();
			});
		});
	} else {
		main();
	}
}

//Helpers
function log(s) {console.log('[' + new Date().toTimeString().substr(0,8) + '] ' + s);}

//API QUERY LOOP
function createTrack(flight_data) {
	var track = {
		name: 'plane',
		trackId: track_ids.get(flight_data[0]),
		timestamp: flight_data[3] * 1000,
		eventType: 0,
		sensorId: 0,
		latitude: flight_data[6],
		longitude: flight_data[5],
		altitude: flight_data[7] || 0,
		speed: flight_data[9] || 0,
		course: flight_data[10] || 0,
		type: 'jet',
		affiliation: 2,
		domain: 3,
		manual: false
	}

	var existing_id = track_ids.get(flight_data[0]);
	if(track.trackId == undefined) {
		track_ids.set(flight_data[0], ++trackId_counter);
		track.trackId = trackId_counter;
		track.eventType = 1;
	}
	return track;
}

function processFlights(error, response, body) {
	var flights = JSON.parse(body);
	var tracks = [];
	var store_counter = 0;
	for(var i = 0; i < flights.states.length; i++) {
		var track = createTrack(flights.states[i]);
		if(argv.store) {
			Track.create(track); //store before encoding
			store_counter++;
		}

		if(!argv.noproduce) {
			tracks.push({
				topic: config.kafka_topic,
				messages: proto.encode(proto.fromObject(track)).finish() //encode before putting on Kafka stream
			});
		}
	}
	if(argv.store) log('Stored approximately ' + store_counter + ' tracks in flights collection...'); 
	if(!argv.noproduce) {
		log('Sending ' + tracks.length + ' tracks across "' + config.kafka_topic + '"...');
		producer.send(tracks, err => {if(err) throw err;});
	}
}

function getFlights() {
	request(query.call, processFlights);
}

function queryLoop() {
	setTimeout(() => {
		getFlights();
		queryLoop();
	}, config.query_rate_seconds * 1000);
}

function main() {
	getFlights();
	queryLoop();
}