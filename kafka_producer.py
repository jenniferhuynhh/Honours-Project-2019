from kafka import KafkaProducer
import json
import threading

systemTracks = json.load(open('SystemTracks.json'));

producer = KafkaProducer(bootstrap_servers=['localhost:9092'], value_serializer=lambda v: json.dumps(v).encode('utf-8'))
# producer.send('tdn-systrk', value=systemTracks[0])
# producer.flush()
ms = 1558411165217

def search(time):
	global systemTracks
	return [element for element in systemTracks if int(element['timestamp']['$numberLong']) == time]

def produce():
	global t
	global ms
	global producer
	tracks = search(ms)
	for track in tracks:
		producer.send('tdn-systrk', value=track)
		producer.flush()
		print(ms)
	ms+=1
	if ms > 1558412028775:
		ms = 1558411165217
		print("RESET")
	t = threading.Timer(0.001, produce)
	t.start();

t = threading.Timer(0.001, produce)
t.start();