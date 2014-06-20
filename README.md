NRLP
Network Resource Lookup Protocol

Drafted by Shulai Zhang

This project is aming to provide a way to help do inner-network resource search and fetch.

The protocol doc is not complete yet, since time is so limited.

The below shows how to make the demo work.

The first thing is to download a MQTT server. The server I use is mosquitto. You can find the information <br> 
about mqtt and mosquitto in the following websites: www.mqtt.org www.mosquitto.org.<br>
After downloading and installation, please start it before other apps.

Then you have to download a node-webkit toolkit. You can find it here: https://github.com/rogerwang/node-webkit

Third, get to the nodejs dir. Lauch two node scripts in bin file. These are two resource provider. They are serving the pictures in nodejs.

Then you can put 2 nw files as well as the batch startup.bat into the node-webkit directory, and just click the bat to start it.

Or you can drag two nws onto the nw.exe icon.

Try "Cristiano" or "Koala" or "German" in the requester input and click the button. You shall see the animator displaying the whole process.

Feel free to disconnect the serving provider and see how resumable downloading works.

I'm now working on the documentation. If anyone is interested in this. You can email me and discuss.

shulai.zhang@sungard.com