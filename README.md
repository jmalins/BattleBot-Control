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
After the default firmware is loaded, the robot should be drivable. In the default configuration, the robot creates a WiFi access point (AP). If you connect to this network and enter the URL of the robot, a user interface will be served up in the browser, allowing you to drive.

 1. Connect to the WiFi network "BattleBot-xxxxxxxxxxxx". "xxxxxxxxxxxx" is a unique string for each robot. 
   * Use a phone or tablet to use the built-in touch interface.
   * Use a computer to use the mouse or a gamepad (coming soon).
 2. Navigate to the robot in a web browser at `http://battlebot.local/`.
 3. Enjoy.
 
## Development Setup ##
Connecting to the robot access point is inconvenient for development, since it generally precludes using the internet at the same time. For development, an alternative configuration is provided. In this setup, the robot will connect to an existing WiFi network. The development machine also connects to this network, making the robot and internet available at the same time.

To prevent hard-coding the network credentials in the source code, WiFi configuration is accomplished via a configuration file uploaded to the robot file system in the `data/` directory of this project.

data/wifi.config:
```
network_ssid:password
```
That is, the SSID of the network to connect to and the password, on one line, separated by a colon. This file should be created in the `data/` directory of this project. A `.gitignore` is present to prevent the file from being checked in to source control inadvertently.

To load the file on the robot, you can either reload the entire file system with the "ESP8266 Sketch Data Upload", or follow faster procedure:

 1. Connect to the robot in the default access point (AP) mode.
 2. Open a commandline and navigate to base project directory, the one with this file in it.
 3. Run this command in a shell:
```
$ ./upload.sh wifi.config
```
This command will upload any file (relative to the root of the `data/` directory) to the robot file system.

When complete, reset the robot. The robot should now connect to the WiFi network specified in the file. To return to access point mode, simply delete the configuration file and reload the file system, or use the abreviated command (as above):
```
$ ./delete.sh wifi.config
```
This command will delete a file from the robot file system.

Note that the `upload.sh` and `delete.sh` can also be used to update the HTML resources on the robot during development. If `upload.sh` is run with no argument, it will upload all file in the `data/` directory. This is slow, but is still significantly faster than reloading the entire file system.

