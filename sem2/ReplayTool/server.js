var mongoose = require('mongoose');
var Track = require('./models/track.js');
var kafka = require('kafka-node');
var protobuf = require('protobufjs');

var kafka_topic = 'tdn-systrk';

//MONGODB SETUP
mongoose.connect('mongodb://localhost:27017/flights', {useNewUrlParser: true, useUnifiedTopology: true}, err => {
	if(err) throw err;
	log('Connected.');
	kafkaSetup();
});

//KAFKA SETUP
var producer, proto;
function kafkaSetup() {
	log('Initialising Kafka producer...');
	var Producer = kafka.Producer;
	var client = new kafka.KafkaClient();
	producer = new Producer(client);

	var topic = {
		topic: kafka_topic,
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
			log('Setup complete, beginning replay');
			main();
		});
	});
}

function main() {
	//Initiate clock with start time
	var main_clock = new Clock(1572125399000);

	main_clock.addEventListener((clock) => {
		Track.find({timestamp:{$gt: clock.previous_time, $lte: clock.time}}, function(err, tracks) {
			if(err) throw err;
			var kafka_messages = [];
			for(var i = 0; i < tracks.length; i++) {
				kafka_messages.push({
					topic: kafka_topic,
					messages: proto.encode(proto.fromObject(tracks[i])).finish() //encode before putting on Kafka stream
				})
			}

			log('Sending ' + kafka_messages.length + ' tracks across "' + kafka_topic + '"...');
			producer.send(kafka_messages, err => {if(err) throw err;});
		});
	});

	main_clock.start();
}

//Helpers
//Ticks counter forward by 'tick_count' milliseconds every 'tick_rate' milliseconds, calls listeners every 'update_rate' milliseconds
class Clock {
	constructor(start_time) {
		this.time = start_time;
		this.previous_time = this.time;
		this.tick_count = 1000;
		this.tick_rate = 1000;
		this.update_rate = 5000;
		this.listeners = [];
	}

	start() {
		this.tickLoop();
		this.updateLoop();
	}

	tickLoop() {
		this.tick();
		setTimeout(() => this.tickLoop(), this.tick_rate);
	}

	updateLoop() {
		this.callListeners();
		this.previous_time = this.time;
		setTimeout(() => this.updateLoop(), this.update_rate);
	}

	tick() {
		this.time += this.tick_count;
	}

	addEventListener(func) {
		this.listeners.push(func);
	}

	callListeners() {
		for(var i = 0; i < this.listeners.length; i++) {
			this.listeners[i](this);
		}
	}
}

function log(s) {console.log('[' + new Date().toTimeString().substr(0,8) + '] ' + s);}