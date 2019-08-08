function KafkaConsumer(){
    this.app;
    this.http;
    this.io;
    this.kafka = require('kafka-node');
    this.bp = require('body-parser');
    this.config = require('./config');

    this.initialise = function(app){
        this.app = app;
        this.http = require('http').Server(app);
        this.io = require('socket.io')(http);

        io.on('connection', function(socket){
            console.log('a user connected');
        });

        http.listen(3000, function(){
            console.log('listening on *:3000');
        });
        
        try {
            const Consumer = kafka.HighLevelConsumer;
            const client = new kafka.Client(config.kafka_server);
            
            let consumer = new Consumer(
                client,
                [{ topic: config.kafka_topic, partition: 0 }],
                {
                    autoCommit: true,
                    fetchMaxWaitMs: 1000,
                    fetchMaxBytes: 1024 * 1024,
                    encoding: 'utf8',
                    fromOffset: false
                }
            );

            consumer.on('message', async function(message) {
                console.log('here');
                console.log(
                    'kafka-> ',
                    message.value
                );
            })
            consumer.on('error', function(err) {
                console.log('error', err);
            });
        }
        catch(e) {
            console.log(e);
        }
    }
}