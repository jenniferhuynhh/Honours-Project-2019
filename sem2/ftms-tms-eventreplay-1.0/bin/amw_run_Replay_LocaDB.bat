@setlocal
@echo off

pushd ..
set PARENT=%CD%
popd

set NODEJS_HOME=C:\Setup_Files\NodeJS\node-v10.15.3-win-x64

set SHIP_SIM_PATH=%PARENT%\apps\ship_sim\
set NAV_INT_PATH=%PARENT%\apps\nav_int\
set SEN_INT_PATH=%PARENT%\apps\sen_int\
set TMS_TM_PATH=%CD%\ftms-tms-trackmanager-1.0\bin\
set TMS_AM_PATH=%CD%\ftms-tms-alertmanager-1.0\bin\
set TMS_ER_PATH=%CD%\ftms-tms-eventreplay-1.0\bin\

set TMS_UI_PATH=%PARENT%\g3-serp2019-master\web_server\

pushd %KAFKA_PATH%
rem echo Starting ZooKeeper
rem start "ZooKeeper" cmd.exe "Zookeeper" /c bin\windows\zookeeper-server-start.bat config\zookeeper.properties
rem pause
rem echo Starting Kafka Broker
rem start "Kafka" cmd.exe /c bin\windows\kafka-server-start.bat config\server.properties
rem pause
rem echo Creating ftms-logs Kafka topic
rem call bin\windows\kafka-topics.bat --zookeeper localhost:2181 --create --topic ftms-logs --partitions 1 --replication-factor 1
rem echo Creating tdn-data Kafka topic
rem call bin\windows\kafka-topics.bat --zookeeper localhost:2181 --create --topic tdn-data --partitions 1 --replication-factor 1
rem echo Creating tdn-alert Kafka topic
rem call bin\windows\kafka-topics.bat --zookeeper localhost:2181 --create --topic tdn-alert --partitions 1 --replication-factor 1
rem echo Creating tdn-systrk Kafka topic
rem call bin\windows\kafka-topics.bat --zookeeper localhost:2181 --create --topic tdn-systrk --partitions 1 --replication-factor 1
rem pause

rem echo Starting Kafka Console Consumer for topic ftms-logs
rem start "ftms-logs" cmd.exe /c bin\windows\kafka-console-consumer.bat --bootstrap-server localhost:9092 --topic ftms-logs
rem pause

rem echo Starting Kafka Console Consumer for topic tdn-data
rem start "Topic: tdn-data" cmd.exe /c bin\windows\kafka-console-consumer.bat --bootstrap-server localhost:9092 --topic tdn-data
rem pause

rem echo Starting Kafka Console Consumer for topic tdn-systrk
rem start "Topic: tdn-systrk" cmd.exe /c bin\windows\kafka-console-consumer.bat --bootstrap-server localhost:9092 --topic tdn-systrk
rem pause

rem echo Starting Kafka Console Consumer for topic tdn-alert
rem start "Topic: tdn-alert" cmd.exe /c bin\windows\kafka-console-consumer.bat --bootstrap-server localhost:9092 --topic tdn-alert
rem popd
rem pause

rem pushd %MONGO_PATH%
rem echo Starting MongoDB
rem start "MongoDB" cmd.exe /c bin\mongod.exe --dbpath %MONGO_DB_PATH%
rem popd
rem pause

pushd %TMS_ER_PATH%
echo Starting Event Replay
start "Event Replay" cmd.exe /c ftms-tms-eventreplay.bat  --DataBaseHost="localhost" --DataBasePort="27017" --DataBaseName="tmsdb" --KafkaSysTracksTopic="tdn-systrk" --KafkaAlertsTopic="tdn-alerts"
popd
pause

rem set PATH=%NODEJS_HOME%;%PATH%
rem pushd %TMS_UI_PATH%
rem echo Starting UI
rem start "UI" cmd.exe /c run_server.bat
rem popd
rem pause



:END
endlocal
@echo on
