start "ZooKeeper" .\kafka_2.12-2.2.0\bin\windows\zookeeper-server-start.bat .\kafka_2.12-2.2.0\config\zookeeper.properties
start "Apache Kafka" .\kafka_2.12-2.2.0\bin\windows\kafka-server-start.bat .\kafka_2.12-2.2.0\config\server.properties
start "Test Consumer" .\kafka_2.12-2.2.0\bin\windows\kafka-console-consumer.bat --bootstrap-server localhost:9092 --topic tdn-systrk