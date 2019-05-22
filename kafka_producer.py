from kafka import KafkaProducer
import json
import threading

systemTracks = json.load(open('SystemTracks.json'));

producer = KafkaProducer(bootstrap_servers=['localhost:9092'], value_serializer=lambda v: json.dumps(v).encode('utf-8'))

i = 0;

def produce():
	global i
	global producer
	global t
	producer.send('tdn-systrk', value=systemTracks[i])
	producer.flush()
	i+=1
	if i >= len(systemTracks):
		i = 0
		print("RESTART")
	t = threading.Timer(1, produce)
	t.start();

t = threading.Timer(1, produce)
t.start();

# def search(time):
# 	global systemTracks
# 	return [element for element in systemTracks if int(element['timestamp']['$numberLong']) == time]
# ms = 1558411165217
# global ms
# tracks = search(ms)
# for track in tracks:
# 	producer.send('tdn-systrk', value=track)
# 	producer.flush()
# 	print(ms)
# ms+=1
# if ms > 1558412028775:
# 	ms = 1558411165217
# 	print("RESET")