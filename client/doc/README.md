# *eesibot* Robotics Framework #

The *eesibot* framework is an open-source software package that simplifies building remote-controlled robots with a browser-based touch interface. The framework contains firmware for the embedded device (currently only the ESP8266 is supported) and a set of Javascript libraries that run in the mobile device browser.

The end user can customize both the user interface and control scheme by editing a single Javascript file. A full-featured robot, with drive and multiple auxilliary systems can be implemented in under 50 lines of code.

## System Architecture ##
This diagram describes the eesibot architecture.

![eesibot Architecture](/client/doc/eesibot-architecture.png)

Defining a full-feature robot only requires editing, at most, two files:
 1. `robot.js` - code that defines the robot setup, user interface and control loop ([documentation](./robot.js.md))
 2. `hardware.json` - driver configuration file that sets the configuration of the underlying hardware ([documentation](./hardware.json.md))

## API Documentation ##
The API documentation for the JavaScript library can be found here:

[API Documentation](https://raw.githack.com/jmalins/BattleBot-Control/new-ui/client/doc/esdoc/index.html)
