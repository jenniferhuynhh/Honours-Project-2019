var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Track = require('./models/track.js');
var UserLayouts = require('./models/layouts.js');
var session = require('express-session');
var kafka = require('kafka-node');
var protobuf = require("protobufjs");

var app = express();

//Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tmsdb', {useNewUrlParser: true});

//Use sessions for tracking logins
var sessionMiddleware = session({
	secret: 'gr9jq1Fvih7l4jBp29TnySC6XOw=',
	resave: true,
	saveUninitialized: false
});

//Socket.io setup
var server = require('http').createServer(app);
var io = require('socket.io')(server);
io.use(function(socket, next){
	sessionMiddleware(socket.request, socket.request.res, next);
});

app.use(sessionMiddleware);

//Kafka and protobuf setups
var topics = ['tdn-systrk', 'tdn-alert', 'tdn-ui-changes'];
var kafkaClient, kafkaConsumer, kafkaProducer, proto;
try {
	//CLIENT SETUP
	kafkaClient = new kafka.KafkaClient();
	kafkaClient.createTopics(topics, function(err, res) {
		if(err) return console.log('Error creating topics', err);

		//CONSUMER SETUP
		var offset = new kafka.Offset(kafkaClient);
		offset.fetchLatestOffsets(topics, function(err, offset) {

			if(err) return console.log('Error fetching offsets', err);

			//Converts topic array into array of objects required for Kafka setup
			var topicObjects = [];
			topics.forEach(function(el){topicObjects.push({topic: el, offset: offset[el][0]});});

			kafkaConsumer = new kafka.Consumer(
				kafkaClient,
				topicObjects, {
					autoCommit: true,
					fetchMaxWaitMs: 1000,
					fetchMaxBytes: 1024 * 1024,
					encoding: 'buffer',
					fromOffset: true
				}
			);
			kafkaConsumer.on('error', function(err) {
				console.log('error', err);
			});

			//PRODUCER SETUP
			//kafkaProducer = new kafka.Producer(kafkaClient);

			//PROTOBUF SETUP
			protobuf.load("tdn.proto", function(err, root) {
				proto = {
					track: root.lookup("tdn.SystemTrack"),
					alert: root.lookup("tdn.Alert")
				};

				//Setups are complete, components are ready; begin implementations
				implementations();
			});
		});
	});
} catch(e) {
	console.log(e);
}

//Called after component's (Kafka, protobuf) setups are complete. Contains implementations of these components.
function implementations() {
	//Consumer implementation
	kafkaConsumer.on('message', async function(message) {
		if(message.topic == "tdn-systrk") {	//Handles incoming tracks
			var track = proto.track.decode(message.value);
			track = proto.track.toObject(track, {enums: String, longs: String});

			Track.findOne({trackId: track.trackId}, function(err, found_track) {
				if(err) return console.log(err);

				if(found_track) { //If changes to track found, overlay those changes before sending to clients
					//console.log(found_track);
					/*for(var prop in found_track) {
						if(Object.prototype.hasOwnProperty.call(found_track, prop)) {
							//console.log(prop);
							track[prop] = found_track[prop];
						}
					}*/
					if(found_track.affiliation != undefined) {
						track.affiliation = found_track.affiliation;
					}
					if(found_track.domain != undefined) {
						track.domain = found_track.domain;
					}
					if(found_track.type != undefined) {
						track.type = found_track.type;
					}
				}
				io.emit('recieve_track_update', track);
			});
		} else if(message.topic == "tdn-alert") { //Handles incoming alerts
			//var alert = proto.alert.decode(message.value);
			var alert = JSON.parse(message.value);
			io.emit('alert', alert);
		}
	});

	var requestCount = 0;
	var manual_track_count = 0;
	//Socket.io implementations
	io.on('connection', function(socket) {
		var address = socket.handshake.address.split(":").pop(); //Gets client's public IP address
		log(address + ' connected');

		//MESSAGING MODULE
		//Send user connect message
		socket.on('username', function(username, role) {
			socket.username = username;
			socket.role = role;
			socket.join(socket.role);
			io.emit('is_online', socket.username);
		});

		//Send user disconnect message
		socket.on('disconnect', function(username) {
			io.emit('is_offline', socket.username);
			var disconnect_address = socket.handshake.address.split(":").pop(); //Gets client's public IP address
			log(disconnect_address + ' disconnected');
		});

		//Send new chat message
		socket.on('chat_message', function(message) {
			io.emit('chat_message', socket.username, message);
		});

		//TRACK MANAGER
		socket.on('get_manual_track_id', function(callback) {
			callback(manual_track_count++);
		});

		//CLASSIFICATION MODULE
		//Send updated track information (with Andy's backend ready)
		/*socket.on('send_track_update', function(track, updatedData) {
			var payload = [{
				topic: 'tdn-ui-changes',
				messages: JSON.stringify(track), //probably need protobuf encode
				partition: 0
			}];
			kafkaProducer.send(payload, function(err, data) {});
		});*/
		//Send updated track information (without Andy's backend, using sysTracksUpdates collection)
		socket.on('send_track_update', function(track, updatedData) {
			updatedData.trackId = track.trackId;
			Track.updateOne({trackId: track.trackId}, updatedData, function(error, writeOpResult) {
				if(!writeOpResult.nModified && !writeOpResult.n) {
					Track.create(updatedData, function(err, user) {
						if(err) return console.log(err);
					});
				}
				io.emit('recieve_track_update', track);
			});
		});

		//WEAPON AUTHORISATION
		socket.on('send_request', function(data){
			data.requestId = requestCount++;
			data.status = "Pending...";
			io.to('wo').emit('receive_request', data);
			io.to('fs').emit('receive_confirmation', data);
			//io.emit('receive_request', data);
			//io.emit('receive_confirmation', data);
		});

		socket.on('send_request_status', function(data){
			io.emit('receive_request_status', data);
		});

		//REPLAY MODULE
		socket.on('get_replay_tracks', function(prevTime, newTime, plotTracks){
			// Get tracks from kafka 'Offset' API
			plotTracks('Test ACK');
		});

		socket.on('get_replay_bounds', function(setBounds){
			// Get start/end from kafka streem
			setBounds('start','end');
		});

		//SETTINGS
		socket.on('save_layout', function(layout_data){
			var session = socket.request.session;
			UserLayouts.updateOne({userId: session.userId, name: layout_data.layout_name}, {layout: layout_data.layout_config}, function(error, writeOpResult) {
				if(!writeOpResult.nModified && !writeOpResult.n) {
					UserLayouts.create({userId: session.userId, name: layout_data.layout_name, layout: layout_data.layout_config}, function(err, layout) {
						if(err) return console.log(err);
					});
				}
			});
		});

		socket.on('load_layouts', function(){
			var session = socket.request.session;
			UserLayouts.find({userId: session.userId}, function(error, layouts) {
				io.emit('receive_layouts', layouts);
			});
		});
	});
}


//Initiate socket.io server
server.listen(3000, function() {
	log('Socket.io service listening on *:3000');
});

//Default Express setup stuff
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'ui/'), {index:false}));

var routes = require('./routes/router');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;

//Logs string to console with timestamp
function log(s) {
	console.log("[" + new Date().toTimeString().substr(0,8) + "] " + s);
}