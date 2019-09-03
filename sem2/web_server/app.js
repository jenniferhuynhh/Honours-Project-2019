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

//connect to mongo
mongoose.connect('mongodb://localhost:27017/tmsdb');
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

  //socket.emit('track', '{"_id":"5ce3779e44fa621aba9623d5","track_id":8000,"name":"nav","timestamp":"1558411165217","eventType":"UPDATE","trackNumber":0,"lastTimeMeasurement":0,"latitude":26.573105999999996,"longitude":56.789406004293305,"altitude":56.789406004293305,"speed":10.000000120227241,"course":270.0000004350488,"state":"UNKNOWN","truthId":"","sensorId":0}');
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

//Logs string to console with timestamp
function log(s) {
  console.log("[" + new Date().toTimeString().substr(0,8) + "] " + s);
}