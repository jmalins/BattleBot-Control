# BattleBot-Control #
This software is a simple, low-cost control system for the cardboard BattleBot community project. The project must support all 
skill levels, from young students to advanced adult makers. Therefore, the chosen platform and technologies are common and 
well-documented: Arduino, HTML5 and javascript. The hope is to leverage common maker skills or build them in inexperienced participants.

#### Platform specifications: ####

 1. NodeMCU (ESP-12E module with ESP8266 controller) and motor shield / breakout board. Available 
    [here](https://www.aliexpress.com/item/NodeMCU-Development-Kit-NodeMCU-Motor-Shield-esp-wifi-esp8266-esp-12e-esp-12e-kit-diy-rc/32445659965.html).
 2. Two ubiquitous, cheap Chinese motor modules (UCCMMs). Available
    [here](https://www.aliexpress.com/item/1X-for-Arduino-Smart-Car-Robot-Plastic-Tire-Wheel-with-DC-3-6V-Gear-Motor-New/32693010819.html).
 3. Arduino core libraries for the [ESP8266](http://esp8266.github.io/Arduino/versions/2.3.0/doc/libraries.html#mdns-and-dns-sd-responder-esp8266mdns-library). 
 4. Control over WiFi from a mobile device or computer via a browser-based user interface.
 
The goal is to keep the cost of a base "kit" to under 20USD.

## Basic Setup ##
This section describes the minimum steps needed to load this firmware onto your NodeMCU. The firmware should work out of the box
for a basic robot setup. Subsequent sections describe the development environment for customizing the firmware.

#### Installation steps: ####

 1. Download and install the [Arduino IDE](https://www.arduino.cc/en/Main/Software). 
 2. Install the ESP8266 devtools add-on. Directions [here](http://www.instructables.com/id/Programming-the-ESP8266-12E-using-Arduino-software/?ALLSTEPS). TODO: include custom directions that also explain quirks of getting to work on OS X.
 3. Install the ESP8266FS file system upload add-on. Directions [here](http://esp8266.github.io/Arduino/versions/2.3.0/doc/filesystem.html).

#### Loading the firmware: ####

 1. Open `BattleBot-Control.ino` in the Arduino IDE.
 2. Ensure the following settings are set in the "Tools" menu:
   * Board: "NodeMCU 1.0 (ESP-12E Module)"
   * CPU Frequency: "80 MHz"
   * Flash Size: "4M (3M SPIFFS)"
   * Upload Speed: "115200"
   * Choose correct serial port for module
 3. Run "Tool" > "ESP8266 Sketch Data Upload" to initialize the file system and load the HTML / javascript user interface
    files to the module. This process takes a while, since it is uploading a formatted 3MB file system image. Spend the time
    pondering what life was like for your great-grandfather on dial-up.
 4. Load the Sketch to the module, "Sketch" > "Upload".
 
#### Driving: ####
After the default firmware is loaded, the robot should be driveable. To test:

 1. Connect to the WiFi network "BattleBot-xxxxxxxxxxxx". "xxxxxxxxxxxx" is a unique string for each robot. 
   * Use a phone or tablet to use the built-in touch interface.
   * Use a computer to use the mouse or a gamepad (coming soon).
 2. Navigate to the robot in a web browser at `http://battlebot.local/`.
 3. Enjoy.
 
