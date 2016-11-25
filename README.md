# BattleBot-Control #
This software is a simple, low-cost control system for the cardboard BattleBot community project. The project must support all 
skill levels, from young students to advanced adult makers. Therefore, the chosen platform and technologies are common and 
well-documented: Arduino, HTML5 and javascript. The hope is to leverage common maker skills or build them in inexperienced participants.

Platform specifications:

 1. NodeMCU (ESP-12E module with ESP8266 controller) and motor shield / breakout board. Available 
    [here](https://www.aliexpress.com/item/NodeMCU-Development-Kit-NodeMCU-Motor-Shield-esp-wifi-esp8266-esp-12e-esp-12e-kit-diy-rc/32445659965.html).
 2. Two ubiquitous, cheap Chinese motor modules (UCCMMs). Available
    [here](https://www.aliexpress.com/item/1X-for-Arduino-Smart-Car-Robot-Plastic-Tire-Wheel-with-DC-3-6V-Gear-Motor-New/32693010819.html).
 3. Arduino core libraries for the [ESP8266](http://esp8266.github.io/Arduino/versions/2.3.0/doc/libraries.html#mdns-and-dns-sd-responder-esp8266mdns-library). 
 4. Control over WiFi from a mobile device or computer via a browser-based user interface.
 
The goal is to keep the cost of a complete "kit" to under 20USD.
