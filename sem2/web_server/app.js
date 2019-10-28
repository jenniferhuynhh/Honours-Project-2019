var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var kafka = require('kafka-node');
var protobuf = require("protobufjs");
//mongoose + models
var mongoose = require('mongoose');
var Track = require('./models/track.js');
var UserLayouts = require('./models/layouts.js');
var UserSettings = require('./models/settings.js');
var ReplayTrack = require('./models/replayTrack.js');
var ReplayAlert = require('./models/replayAlert.js');
var FiringRequest = require('./models/firing_request.js');

var app = express();

//Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tmsdb', {useNewUrlParser: true}, ()=>{
	//clear firing request
	mongoose.connection.db.dropCollection('FiringRequest', ()=> {/*supress errors*/});
});

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
	kafkaConsumer.on('message', function(message) {
		if(message.topic == "tdn-systrk") {	//Handles incoming tracks
			var track_data = proto.track.decode(message.value);
			track_data = proto.track.toObject(track_data, {enums: String, longs: String});

			Track.findOne({trackId: track_data.trackId}, function(err, found_track) {
				if(err) return console.log(err);

				if(found_track) { //If changes to track found, overlay those changes before sending to clients
					//console.log(found_track);
					/*for(var prop in found_track) {
						if(Object.prototype.hasOwnProperty.call(found_track, prop)) {
							//console.log(prop);
							track_data[prop] = found_track[prop];
						}
					}*/
					if(found_track.affiliation != undefined) {
						track_data.affiliation = found_track.affiliation.toLowerCase();
					}
					if(found_track.domain != undefined) {
						track_data.domain = found_track.domain.toLowerCase();
					}
					if(found_track.type != undefined) {
						track_data.type = found_track.type.toLowerCase();
					}
				}

				ReplayTrack.create(track_data);
				io.emit('recieve_track_update', track_data);
			});
		} else if(message.topic == "tdn-alert") { //Handles incoming alerts
			//var alert = proto.alert.decode(message.value);
			var alert = JSON.parse(message.value);
			ReplayAlert.create({timestamp:alert.timestamp['$numberLong'], severity:alert.severity, text:alert.text});
			io.emit('alert', alert);
		}
	});

	var requestCount = 1;
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
		/*socket.on('send_track_update', function(track, update_data) {
			var payload = [{
				topic: 'tdn-ui-changes',
				messages: JSON.stringify(track), //probably need protobuf encode
				partition: 0
			}];
			kafkaProducer.send(payload, function(err, data) {});
		});*/
		//Send updated track information (without Andy's backend, using sysTracksUpdates collection)
		socket.on('send_track_update', function(track, update_data) {
			//update_data.trackId = track.trackId;
			/*Track.findOne({trackId: track.trackId}, function(err, found_track) {
				if(err) return console.log(err);

				if(found_track) {
					found_track.update(update_data, function(error, writeOpResult) {
						Track.findOne({trackId: track.trackId}, function(err, found_track) {
							console.log(found_track);
						});
					});
				} else {
					Track.create(update_data, function(err, new_track) {
						if(err) return console.log(err);
						found_track = new_track;
					});
				}
				//console.log(found_track);
				io.emit('recieve_track_update', found_track);
			});*/
			Track.updateOne({trackId: track.trackId}, update_data, function(error, writeOpResult) {
				if(!writeOpResult.nModified && !writeOpResult.n) {
					Track.create(update_data, function(err, new_track) {
						if(err) return console.log(err);
					});
				}
				io.emit('recieve_track_update', track);
			});
		});

		//WEAPON AUTHORISATION
		socket.on('send_request', function(data){
			data.requestId = requestCount++;
			data.status = "pending";
			data.username = socket.request.session.username;
			data.timestamp = new Date().getTime();
			FiringRequest.create(data, (err)=>{
				if(err) return console.log(err);
				
				io.to('wo').emit('receive_request', data);
				io.to('fs').emit('receive_confirmation', data);			
			});
		});

		socket.on('send_request_status', function(data){
			FiringRequest.updateOne({requestId: data.requestId}, {status: data.status}, function(error, writeOpResult) {
				if(error) return console.log(error);
				if(writeOpResult.nModified) {
					io.emit('receive_request_status', data);
				};
			});
		});

		socket.on('get_all_requests', function(){
			var role = socket.request.session.role;
			if(role == 'wo'){
				FiringRequest.find({status: 'pending'}, (err, firing_requests)=>{
					socket.emit('receive_all_requests', firing_requests);
				});
			}
			else if(role == 'fs'){
				FiringRequest.find({}, (err, firing_requests)=>{
					socket.emit('receive_all_confirmations', firing_requests);
				});
			}
		});

		socket.on('delete_response', function(requestId){
			console.log(requestId);
			console.log("hi");
			FiringRequest.deleteOne({requestId: requestId}, ()=>{
				console.log('deleted');
				io.emit('response_deleted', requestId);
			});
		});

		//REPLAY MODULE
		socket.on('get_replay_data', function(prevTime, newTime, displayReplayData){
			// Get tracks from kafka 'Offset' API
			ReplayTrack.find({timestamp:{$gt: prevTime, $lte: newTime}}, function(err, tracks){
				if (err)
					return console.error(err);

				ReplayAlert.find({timestamp:{$gt: prevTime, $lte: newTime}}, function(err, alerts){
					if (err)
						return console.error(err);

					displayReplayData({tracks:tracks, alerts:alerts});
				});
			});
		});

		socket.on('get_replay_bounds', function(setBounds){
			// Check if replay collection is empty
			mongoose.connection.db.collection('replaytracks').count(function(err, count) {
				if (this.err)
					return console.error(this.err);
				else if (count == 0)
					return setBounds(0, Date.now());
				
				// Get start/end from Mongo Replay Tracks
				ReplayTrack.aggregate().
				group({ _id: null, maxTS: { $max: '$timestamp' }, minTS: { $min: '$timestamp' } }).
				project('_id maxTS minTS').
				exec(function (err, r) {
					if (this.err)
						return console.error(this.err);
						
					setBounds(r[0].minTS, r[0].maxTS);
				});
			});
		});

		//SETTINGS
		socket.on('save_layout', function(layout_data){
			var session = socket.request.session;
			UserLayouts.updateOne({userId: session.userId, name: layout_data.layout_name}, {layout: layout_data.layout_config}, function(error, writeOpResult) {
				if(!writeOpResult.nModified && !writeOpResult.n) {
					UserLayouts.create({userId: session.userId, name: layout_data.layout_name, layout: layout_data.layout_config}, function(err) {
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

		socket.on('save_settings', function(settings_data){
			var session = socket.request.session;
			UserSettings.updateOne({userId: session.userId}, {settings: settings_data}, function(error, writeOpResult) {
				if(error) return console.log(error);
				if(!writeOpResult.nModified && !writeOpResult.n) {
					UserSettings.create({userId: session.userId, settings: settings_data}, function(err) {
						if(err) return console.log(err);
					});
				}
			});
		});

		socket.on('load_settings', function(callback){
			var session = socket.request.session;
			UserSettings.findOne({userId: session.userId}, function(error, userSettings) {
				if(userSettings){
					callback(userSettings.settings);
				}
				else{
					callback(null);
				}
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