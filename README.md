# g3-serp2019
GitHub repository for Group 3 - SERP 2019

Pre-requisites:
- 'kakfa-python' for the producer script ('pip install kafka-python')

Running on Windows:
1. Run start1.bat
2. Run start2.bat
3. Run start3.bat
4. Run .\web_server\run_server.bat
5. In your Web Browser go to http://localhost:3000

Running on Linux:
1. Run './kafka_2.12-2.2.0/bin/zookeeper-server-start.sh ./kafka_2.12-2.2.0/config/zookeeper.properties'
2. Run './kafka_2.12-2.2.0/bin/kafka-server-start.sh ./kafka_2.12-2.2.0/config/server.properties'
3. Run 'python kafka_producer.py'
4. Run 'npm start' in web_server
5. In your Web Browser go to http://localhost:3000

Notes:
- It takes approx. 1 minute of real time for the producer to arrive at a second track
- There is approx. 2 hours 2 minutes worth of data before it restarts, this will not remove the tracks, they will just jump back to their initial position when the producer sends the data through
- The tracks do not move by a large amount, so zooming in on a single track is the best way to see movement