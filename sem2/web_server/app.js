var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');

var routes = require('./routes/router');

var app = express();

// Apache Kafka
var kafka = require('kafka-node');

// Protocol Buffer
var protobuf = require("protobufjs");
var protoBuilder;
var protoMessageType;

//connect to mongo
mongoose.connect('mongodb://localhost:27017/tmsdb', {useNewUrlParser: true});
var db = mongoose.connection;

//use sessions for tracking logins
app.use(session({
  secret: 'gr9jq1Fvih7l4jBp29TnySC6XOw=',
  resave: true,
  saveUninitialized: false
}));

//Socket.io
var server = require('http').createServer(app);
var io = require('socket.io')(server);

//Messaging module code
io.on('connection', function(socket) {
  var address = socket.handshake.address.split(":").pop(); //Gets client's public IP address
  log(address + ' connected');

  //Send user connect message
  socket.on('username', function(username) {
    socket.username = username;
    io.emit('is_online', socket.username);
  });

  //Send user disconnect message
  socket.on('disconnect', function(username) {
    io.emit('is_offline', socket.username);
    var address = socket.handshake.address.split(":").pop(); //Gets client's public IP address
    log(address + ' disconnected');
  })

  //Send new chat message
  socket.on('chat_message', function(message) {
    io.emit('chat_message', socket.username, message);
  });
});

//Initiate socket.io server
server.listen(3000, function() {
  log('Messaging service listening on *:3000');
});

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

// Protobuffer from proto file provided by clients
protoBuilder = protobuf.load("tdn.proto", function(err, root){
  protoMessageType = root.lookup("tdn.SystemTrack");
});

// Kafka code to create consumer for tracks
try {
  let trackTopic = 'tdn-systrk';
  let trackClient = new kafka.KafkaClient({kafkaHost:'localhost:9092'});

  trackClient.loadMetadataForTopics([trackTopic], (err, response) => {
    if (err){
      console.log(err);
      return
    }

    if (response[1].error){
      console.log("Tracks topic not found and has now been created.")
      return 
    }
  });
  
  let trackConsumer = new kafka.Consumer(
    trackClient,
    [{ topic: trackTopic, partition: 0 }],
    {
      autoCommit: true,
      fetchMaxWaitMs: 1000,
      fetchMaxBytes: 1024 * 1024,
      encoding: 'buffer',
      fromOffset: false
    }
  );

  trackConsumer.on('message', function(message) {
    var dec = protoMessageType.decode(message.value);
    io.emit('track', dec);

  });
  
  trackConsumer.on('error', function(err) {
    console.log('error', err);
  });
}catch(e){
  console.log('Problem with Creating Kafka Consumer (Tracks) - Below');
  console.log(e);
  console.log('Problem with Creating Kafka Consumer (Tracks) - Above');
}

// Kafka code to create consumer for alerts
try {
  let alertTopic = 'tdn-alerts'
  let alertClient = new kafka.KafkaClient({kafkaHost:'localhost:9092'});
  
  alertClient.loadMetadataForTopics([alertTopic], (err, response) => {
    if (err){
      console.log("Error1");
      console.log(err);
      console.log("");
      return
    }

    if (response[1].error){
      console.log("Alerts topic not found and has now been created.")
      return 
    }
  });

  let alertConsumer = new kafka.Consumer(
    alertClient,
    [{ topic: alertTopic, partition: 0 }],
    {
      autoCommit: true,
      fetchMaxWaitMs: 1000,
      fetchMaxBytes: 1024 * 1024,
      encoding: 'buffer',
      fromOffset: false
    }
  );

  alertConsumer.on('message', function(message) {
    console.log('Kafka Alert');
    var dec = protoMessageType.decode(message.value);
    console.log(dec);
    io.emit('alert', dec);

  });
  
  alertConsumer.on('error', function(err) {
    console.log('error', err);
  });
}catch(e){
  console.log('Problem with Creating Kafka Consumer (Alerts) - Below');
  console.log(e);
  console.log('Problem with Creating Kafka Consumer (Alerts) - Above');
}

//Logs string to console with timestamp
function log(s) {
  console.log("[" + new Date().toTimeString().substr(0,8) + "] " + s);
}