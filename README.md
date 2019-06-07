# g3-serp2019
GitHub repository for Group 3 - SERP 2019

Pre-requisites:
	MongoDB:
		- Port: 27017
		- Database: tmsdb
		- Collection: systemTracks
		- Import the SystemTracksImport.json to this collection

Running on Windows:
1. Run start1.bat
2. Run start2.bat
3. Run .\eventreplay\start.bat
4. Run .\web_server\run_server.bat

Running on Linux:
1. Run './kafka_2.12-2.2.0/bin/zookeeper-server-start.sh ./kafka_2.12-2.2.0/config/zookeeper.properties'
2. Run './kafka_2.12-2.2.0/bin/kafka-server-start.sh ./kafka_2.12-2.2.0/config/server.properties'
3. Run ./eventreplay/start.bat
4. Run 'npm start' in web_server

In your Web Browser go to http://localhost:3000