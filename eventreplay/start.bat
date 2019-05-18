java -cp .;
.\eventreplay.jar;
.\slf4j-api-1.7.26.jar;
.\slf4j-simple-1.7.26.jar;
.\log4j-1.2.17.jar;
.\commons-cli-1.4.jar;
.\kafka-clients-2.1.1.jar;
.\mongo-java-driver-3.10.1.jar;
.\gson-2.8.0.jar  au.gov.defence.dst.ftms.tms.eventreplay.Main --DataBaseHost="localhost" --DataBasePort="27017" --DataBaseName="tmsdb";