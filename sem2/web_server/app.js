var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// Apache Kafka
var kafka = require('kafka-node');

// Protocol Buffer
var protobuf = require("protobufjs");
var protoBuilder;
var protoMessageType;

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
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

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

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/',
                                   failureFlash: true })
);

module.exports = app;

// Kafka/protobuf.js
protoBuilder = protobuf.load("tdn.proto", function(err, root){
  protoMessageType = root.lookup("tdn.SystemTrack");
});

try {
  const client = new kafka.KafkaClient('localhost:9092');
  
  let consumer = new kafka.Consumer(
    client,
    [{ topic: 'tdn-systrk', partition: 0 }],
    {
      autoCommit: true,
      fetchMaxWaitMs: 1000,
      fetchMaxBytes: 1024 * 1024,
      encoding: 'buffer',
      fromOffset: false
    }
  );

  consumer.on('message', async function(message) {
    var dec = protoMessageType.decode(message.value);
    io.emit('track', JSON.stringify(dec));

  })
  consumer.on('error', function(err) {
    console.log('error', err);
  });
}catch(e) {
  console.log(e);
}

//Logs string to console with timestamp
function log(s) {
  console.log("[" + new Date().toTimeString().substr(0,8) + "] " + s);
}