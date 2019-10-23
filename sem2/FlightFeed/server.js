// FlightFeed tool - Grabs flight data from 'opensky-network.org' API every 10 seconds 
// and transforms them into tracks to be consumed by the FTMS UI.
// Command line argument [bounded|all] determines whether the queries are bounded or not.
// Boundaries and Kafka topic can be configured in config.json
var request = require("request");
var kafka = require('kafka-node');
var protobuf = require("protobufjs");
var config = require("./config.json");

log("Starting setup...");
//KAFKA SETUP
var Producer = kafka.Producer,
	client = new kafka.KafkaClient(),
	producer = new Producer(client),
	payloads = [];
	creating_topics = [];

var topic = {
	topic: config.kafka_topic,
	partitions: 1,
	replicationFactor: 1
}
client.createTopics([topic], err => {if(err) throw err;});

var proto;
producer.on('ready', () => {
	protobuf.load("tdn.proto", function(err, root) {
		if(err) throw err;
		proto = root.lookup("tdn.SystemTrack");
		log("Setup complete, beginning feed");
		main();
	});
});

//API QUERY LOOP
var query = {
	endpoint: "https://ftmsopensky:ftms2019@opensky-network.org/api",
	operation: "/states/all",
	bounding_box_call: "?lamin=" + config.bounding_box.lower.lat + "&lomin=" + config.bounding_box.lower.long + "&lamax=" + config.bounding_box.upper.lat + "&lomax=" + config.bounding_box.upper.long,
	get call() {
		if(process.argv[2] == "all") {
			return this.endpoint + this.operation;
		} else if(process.argv[2] == "bounded") {
			return this.endpoint + this.operation + this.bounding_box_call
		}
		return this.endpoint + this.operation + this.bounding_box_call; //Return bounded by default
	}
}

var track_ids = new Map();
var trackId_counter = config.IDs_start;

function createTrack(flight_data) {
	var track = {
		trackId: track_ids.get(flight_data[0]),
		name: "plane",
		timestamp: flight_data[3],
		eventType: 0,
		sensorId: 0,
		latitude: flight_data[6],
		longitude: flight_data[5],
		altitude: flight_data[7] || 0,
		speed: flight_data[9] || 0,
		course: flight_data[10] || 0,
		type: "jet",
		affiliation: 2,
		domain: 3,
		manual: false
	}

	var existing_id = track_ids.get(flight_data[0]);
	if(track.trackId == undefined) {
		track_ids.set(flight_data[0], ++trackId_counter);
		track.trackId = trackId_counter;
		eventType = 1;
	}

	var encoded_track = proto.encode(proto.fromObject(track)).finish();
	return encoded_track;
}

function processFlights(error, response, body) {
	var flights = JSON.parse(body);
	var tracks = [];
	for(var i = 0; i < flights.states.length; i++) {
		tracks.push({
			topic: config.kafka_topic,
			messages: createTrack(flights.states[i])
		});
	}
	log("Sending " + tracks.length + " tracks across '" + config.kafka_topic + "'...");
	producer.send(tracks, err => {if(err) throw err;});
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

//Helpers
function log(s) {console.log("[" + new Date().toTimeString().substr(0,8) + "] " + s);}