var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Track = require('./models/track.js');
var session = require('express-session');
var kafka = require('kafka-node');
var protobuf = require("protobufjs");

var app = express();

<<<<<<< HEAD
// Protobuffer from proto file provided by clients
var protoMessageType;
var protoBuilder = protobuf.load("tdn.proto", function(err, root){
  protoMessageType = root.lookup("tdn.SystemTrack");
});

var trackTopic = 'tdn-systrk';
var trackOffset;

var alertTopic = 'tdn-alerts';
var alertOffset;

var offsetClient = new kafka.KafkaClient({kafkaHost:'localhost:9092'});
var offset = new kafka.Offset(offsetClient);

var trackClient = new kafka.KafkaClient({kafkaHost:'localhost:9092'});
var trackConsumer;

var alertClient = new kafka.KafkaClient({kafkaHost:'localhost:9092'});
var alertConsumer;

var uiChangeClient = new kafka.KafkaClient({kafkaHost:'localhost:9092'});
var uiChangeProducer;

// Gets metadata of topics in an attempt to create them
offsetClient.loadMetadataForTopics([trackTopic, alertTopic, 'tdn-ui-changes'], (err, response) => {
  if (err){
    console.log("Error getting metadata of topics");
    return console.log(err);
  }

  // Gets latest offset of topics so they consume from the latest messages
  offset.fetchLatestOffsets([trackTopic, alertTopic], function(err, offset){
    if (err){
      console.log('Error Getting Kafka Offsets');
      return console.log(err);
    }

    trackOffset = offset[trackTopic][0];
    alertOffset = offset[alertTopic][0];

    // Create track consumer and set it's event listeners
    trackConsumer = new kafka.Consumer(
      trackClient,
      [{ topic: trackTopic, partition: 0, offset: trackOffset }],
      {
        autoCommit: true,
        fetchMaxWaitMs: 1000,
        fetchMaxBytes: 1024 * 1024,
        encoding: 'buffer',
        fromOffset: true
      }
    );

    trackConsumer.on('message', async function(message) {
      var dec = protoMessageType.decode(message.value);
      io.emit('recieve_track_update', JSON.stringify(dec));
    });

    trackConsumer.on('error', function(err) {
      console.log('error', err);
    });

    // Create alert consumer and set it's event listeners
    alertConsumer = new kafka.Consumer(
      alertClient,
      [{ topic: alertTopic, partition: 0, offset: alertOffset }],
      {
        autoCommit: true,
        fetchMaxWaitMs: 1000,
        fetchMaxBytes: 1024 * 1024,
        // encoding: 'buffer',
        encoding: 'utf-8',
        fromOffset: true
      }
    );

    alertConsumer.on('message', async function(message) {
      // var dec = protoMessageType.decode(message.value);
      var dec = JSON.parse(message.value);
      // console.log(dec);
      io.emit('alert', dec);

    });
    
    alertConsumer.on('error', function(err) {
      console.log('error', err);
    });

    uiChangeProducer = new kafka.Producer(uiChangeClient);
  });
});

//connect to MongoDB
=======
//Kafka consumer/producer setup
var kafkaClient, kafkaConsumer, kafkaProducer;
try {
	kafkaClient = new kafka.KafkaClient();
	kafkaConsumer = new kafka.Consumer(
		kafkaClient,
		[{
			topic: 'tdn-systrk',
			partition: 0
		}], {
			autoCommit: true,
			fetchMaxWaitMs: 1000,
			fetchMaxBytes: 1024 * 1024,
			encoding: 'buffer',
			fromOffset: false
		}
	);
	//kafkaProducer = new kafka.Producer(kafkaClient);

	kafkaConsumer.on('error', function(err) {
		console.log('error', err);
	});
} catch(e) {
	console.log(e);
}

//Connect to MongoDB
>>>>>>> a639af3e48a00551a4069eb5616809e532aacf28
mongoose.connect('mongodb://localhost:27017/tmsdb', {useNewUrlParser: true});

//Use sessions for tracking logins
app.use(session({
	secret: 'gr9jq1Fvih7l4jBp29TnySC6XOw=',
	resave: true,
	saveUninitialized: false
}));

//Socket.io setup
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var requestCount = 0;

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

	//CLASSIFICATION MODULE
	//Send updated track information (with Andy's backend ready)
	/*socket.on('send_track_update', function(track, updatedData) {
		var payload = [{
			topic: 'tdn-ui-changes',
			messages: JSON.stringify(track),
			partition: 0
		}];

<<<<<<< HEAD
		uiChangeProducer.send(payload, function(err, data) {});
=======
		kafkaProducer.send(payload, function(err, data) {});
	});*/
	//Send updated track information (without Andy's backend, using sysTracksUpdates collection)
	socket.on('send_track_update', function(track, updatedData) {
		updatedData.trackId = track.trackId;
		Track.updateOne({trackId: track.trackId}, updatedData, function(error, writeOpResult) {
			if(!writeOpResult.nModified) {
				Track.create(updatedData, function(err, user) {
					if(err) return console.log(err);
				});
			}
			io.emit('recieve_track_update', JSON.stringify(track));
		});
	});

	//Weapon Authorisation 
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
>>>>>>> a639af3e48a00551a4069eb5616809e532aacf28
	});

	//socket.emit('track', '{"_id":"5ce3779e44fa621aba9623d5","track_id":8000,"name":"nav","timestamp":"1558411165217","eventType":"UPDATE","trackNumber":0,"lastTimeMeasurement":0,"latitude":26.573105999999996,"longitude":56.789406004293305,"altitude":56.789406004293305,"speed":10.000000120227241,"course":270.0000004350488,"state":"UNKNOWN","truthId":"","sensorId":0}');

});

<<<<<<< HEAD
=======
//Kafka consumer + protobuf implementation
//CLASSIFICATION MODULE
var protoBuilder = protobuf.load("tdn.proto", function(err, root){
	var proto_SystemTrack = root.lookup("tdn.SystemTrack");

	kafkaConsumer.on('message', async function(message) {
		if(message.topic == "tdn-systrk") {
			var dec = proto_SystemTrack.decode(message.value);
			var track = JSON.parse(JSON.stringify(dec));
			Track.findOne({trackId: track.trackId}, function(error, found_track) {
				if(err) return console.log(err);

				if(found_track) { //If changes to track found, overlay those changes before sending to clients
					//console.log(found_track);
					/*for(var prop in found_track) {
						if(Object.prototype.hasOwnProperty.call(found_track, prop)) {
							//console.log(prop);
							track[prop] = found_track[prop];
						}
					}*/
					if (found_track.affiliation != undefined) {
						track.affiliation = found_track.affiliation;
					}
					if (found_track.domain != undefined) {
						track.domain = found_track.domain;
					}
					if (found_track.type != undefined) {
						track.type = found_track.type;
					}
					//console.log("");
					//console.log(track);
				}
				io.emit('recieve_track_update', JSON.stringify(track));
			});
		}
	});
});

>>>>>>> a639af3e48a00551a4069eb5616809e532aacf28
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