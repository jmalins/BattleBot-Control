/* 
  Cardboard BattleBot Control Firmware
  Copyright (c) 2016 Jeff Malins. All rights reserved.
  
  Adapted from FSBrowser - Example WebServer with SPIFFS backend for esp8266
  Copyright (c) 2015 Hristo Gochkov.
 
  This library is free software; you can redistribute it and/or
  modify it under the terms of the GNU Lesser General Public
  License as published by the Free Software Foundation; either
  version 2.1 of the License, or (at your option) any later version.
  This library is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
  Lesser General Public License for more details.
  You should have received a copy of the GNU Lesser General Public
  License along with this library; if not, write to the Free Software
  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

/*
  upload the contents of the data folder with MkSPIFFS Tool ("ESP8266 Sketch Data Upload" in Tools menu in Arduino IDE)
  or you can upload the contents of a folder if you CD in that folder and run the following command:
  for file in `ls -A1`; do curl -F "file=@$PWD/$file" esp8266fs.local/edit; done
  
  access the sample web page at http://esp8266fs.local
  edit the page by going to http://esp8266fs.local/edit
*/
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <FS.h>
#include <stdlib.h>
#include <Servo.h>

#include "NodeMCU-Hardware.h"

/********************************************************************************
 * Network Configuration                                                        *
 ********************************************************************************/
 
#define SERVER_PORT   80
#define HOST_NAME     "battlebot"
#define AP_SSID_BASE  "BattleBot-"

/********************************************************************************
 * Globals                                                                      *
 ********************************************************************************/

// states //
enum RobotState {
  STATE_START = 1,
  STATE_SETUP,
  STATE_CONNECT,
  STATE_IDLE,
  STATE_DRIVING
};

// function prototypes //
void enterState(RobotState);
void runStateMachine(void);
bool getWiFiForceAPMode();

#define DBG_OUTPUT_PORT Serial

/********************************************************************************
 * WiFi Setup                                                                   *
 *  Implement flexible WiFi setup. The default is create an access point for    *
 *  the controller device to connect to. This is inconvenient for development,  *
 *  however. If a file called `wifi.config` is present in the file system,      *
 *  then the controller will instead connect to an existing WiFi network.       *
 *                                                                              *
 *  The format of `wifi.config` is one line:                                    *
 *  SSID:password                                                               *
 ********************************************************************************/

#define WIFI_CONFIG_FILE "/wifi.config"

// configure and connect to wifi //
void setupWiFi() {
  // check for config file //
  String ssid, password;
  if(SPIFFS.exists(WIFI_CONFIG_FILE)) {
    DBG_OUTPUT_PORT.println("WiFi configuration found");
 
    File file = SPIFFS.open(WIFI_CONFIG_FILE, "r");
    String contents = file.readString();
    int index = contents.indexOf(":");
    ssid     = contents.substring(0, index);
    password = contents.substring(index + 1);
    password.trim(); // file may have trailing whitespace //
    file.close();
  }

  bool stationMode = !!ssid.length() && !getWiFiForceAPMode();
  if(stationMode) {
    // connect to WiFi network //
    WiFiMode_t oldMode = WiFi.getMode();
    WiFi.mode(WIFI_STA);
    DBG_OUTPUT_PORT.printf("Connecting to \'%s\'...\n", ssid.c_str());
    if(oldMode != WIFI_STA || String(WiFi.SSID()) != ssid) {
      DBG_OUTPUT_PORT.println("Resetting connection");
      WiFi.begin(ssid.c_str(), password.c_str());
    }
    enterState(STATE_CONNECT);
    long connectTimeout = millis() + 10000; // 10 seconds //
    while (WiFi.status() != WL_CONNECTED) {
      yield(); // need to yield or we get a WDT reset //
      runStateMachine();
      if(millis() > connectTimeout) {
        DBG_OUTPUT_PORT.println("Connect timed out, falling back to AP mode");
        stationMode = false; // after timeout, fallback
        break;
      }
    }
    enterState(STATE_SETUP);
  }

  if(stationMode) {
    DBG_OUTPUT_PORT.println("");
    DBG_OUTPUT_PORT.print("Connected! IP address: ");
    DBG_OUTPUT_PORT.println(WiFi.localIP());
  } else {
    // access point mode //
    byte mac[6];
    WiFi.softAPmacAddress(mac);
    ssid = AP_SSID_BASE;
    for(int i = 5; i >= 0; i--) {
      ssid += String(mac[i], HEX);
    } 

    DBG_OUTPUT_PORT.println("Starting AP, SSID: " + ssid);
    WiFi.mode(WIFI_AP);
    WiFi.softAP(ssid.c_str());
    DBG_OUTPUT_PORT.println("");
    DBG_OUTPUT_PORT.print("Started! IP address: ");
    DBG_OUTPUT_PORT.println(WiFi.softAPIP());
  }

  // start mDNS //
  MDNS.begin(HOST_NAME);
  DBG_OUTPUT_PORT.print("Open http://");
  DBG_OUTPUT_PORT.print(HOST_NAME);
  DBG_OUTPUT_PORT.println(".local/ to access user interface");
}

/********************************************************************************
 * Web Server                                                                   *
 *  Implementation of web server methods to server up the UI web resources and  *
 *  allow updating of modifications during development.                         *
 ********************************************************************************/

// web server instance //
ESP8266WebServer server(SERVER_PORT);

// file handle for the current upload //
File fsUploadFile;

// format file size as a human-readable string //
String formatFileSize(size_t bytes){
  if (bytes < 1024){
    return String(bytes) + "B";
  } else if (bytes < (1024 * 1024)){
    return String(bytes/1024.0) + "KB";
  } else if (bytes < (1024 * 1024 * 1024)){
    return String(bytes / 1024.0 / 1024.0) + "MB";
  } else {
    return String(bytes / 1024.0 / 1024.0 / 1024.0) + "GB";
  }
}

// infer the content type from the file extension //
String getContentType(String filename){
  if (server.hasArg("download"))       return "application/octet-stream";
  else if (filename.endsWith(".htm"))  return "text/html";
  else if (filename.endsWith(".html")) return "text/html";
  else if (filename.endsWith(".css"))  return "text/css";
  else if (filename.endsWith(".js"))   return "application/javascript";
  else if (filename.endsWith(".png"))  return "image/png";
  else if (filename.endsWith(".gif"))  return "image/gif";
  else if (filename.endsWith(".jpg"))  return "image/jpeg";
  else if (filename.endsWith(".ico"))  return "image/x-icon";
  else if (filename.endsWith(".xml"))  return "text/xml";
  else if (filename.endsWith(".pdf"))  return "application/x-pdf";
  else if (filename.endsWith(".zip"))  return "application/x-zip";
  else if (filename.endsWith(".gz"))   return "application/x-gzip";
  return "text/plain";
}

// serve the contents of a file back to client //
bool handleFileRead(String path){
  DBG_OUTPUT_PORT.println("handleFileRead: " + path);
  if (path.endsWith("/")) path += "index.html";
  String contentType = getContentType(path);
  String pathWithGz = path + ".gz";
  if (SPIFFS.exists(pathWithGz) || SPIFFS.exists(path)){
    if (SPIFFS.exists(pathWithGz))
      path += ".gz";
    File file = SPIFFS.open(path, "r");
    size_t sent = server.streamFile(file, contentType);
    file.close();
    return true;
  }
  return false;
}

// update the contents of a file in the file system //
void handleFileUpload(){
  if (server.uri() != "/edit") return;
  HTTPUpload& upload = server.upload();
  if (upload.status == UPLOAD_FILE_START) {
    String filename = upload.filename;
    if (!filename.startsWith("/")) filename = "/"+filename;
    DBG_OUTPUT_PORT.print("handleFileUpload Name: "); DBG_OUTPUT_PORT.println(filename);
    fsUploadFile = SPIFFS.open(filename, "w");
    filename = String();
  } else if (upload.status == UPLOAD_FILE_WRITE) {
    DBG_OUTPUT_PORT.print("handleFileUpload Data: "); DBG_OUTPUT_PORT.println(upload.currentSize);
    if (fsUploadFile)
      fsUploadFile.write(upload.buf, upload.currentSize);
  } else if (upload.status == UPLOAD_FILE_END) {
    if (fsUploadFile) 
      fsUploadFile.close();
    DBG_OUTPUT_PORT.print("handleFileUpload Size: "); DBG_OUTPUT_PORT.println(upload.totalSize);
  }
}

// delete a file from the file system //
void handleFileDelete(){
  if (server.args() == 0) return server.send(500, "text/plain", "BAD ARGS");
  String path = server.arg(0);
  DBG_OUTPUT_PORT.println("handleFileDelete: " + path);
  if (path == "/")
    return server.send(500, "text/plain", "BAD PATH");
  if (!SPIFFS.exists(path))
    return server.send(404, "text/plain", "FileNotFound");
  SPIFFS.remove(path);
  server.send(200, "text/plain", "");
  path = String();
}

// return the contents of a directory in the file system as JSON //
void handleFileList() {
  if (!server.hasArg("dir")) {server.send(500, "text/plain", "BAD ARGS"); return;}
    
  String path = server.arg("dir");
  DBG_OUTPUT_PORT.println("handleFileList: " + path);
  Dir dir = SPIFFS.openDir(path);
  path = String();

  String output = "[";
  while (dir.next()){
    File entry = dir.openFile("r");
    if (output != "[") output += ',';
    bool isDir = false;
    output += "{ \"type\": \"";
    output += (isDir)?"dir":"file";
    output += "\", \"name\": \"";
    output += String(entry.name()).substring(1);
    output += "\", \"size\": \"";
    output += formatFileSize(entry.size());
    output += "\" }";
    entry.close();
  }
  output += "]";
  server.send(200, "text/json", output);
}

/*
void handleFileCreate(){
  if (server.args() == 0)
    return server.send(500, "text/plain", "BAD ARGS");
  String path = server.arg(0);
  DBG_OUTPUT_PORT.println("handleFileCreate: " + path);
  if (path == "/")
    return server.send(500, "text/plain", "BAD PATH");
  if (SPIFFS.exists(path))
    return server.send(500, "text/plain", "FILE EXISTS");
  File file = SPIFFS.open(path, "w");
  if (file)
    file.close();
  else
    return server.send(500, "text/plain", "CREATE FAILED");
  server.send(200, "text/plain", "");
  path = String();
}
*/

/********************************************************************************
 * Hardware Control                                                             *
 *  Handle control of robot hardware based on calls to the web API.             *
 ********************************************************************************/

// map motor driver channels //
#define PIN_R_PWM   PIN_PWM_A   // A is right      //
#define PIN_R_DIR   PIN_DIR_A   // high is forward //

#define PIN_L_PWM   PIN_PWM_B   // B is left       //
#define PIN_L_DIR   PIN_DIR_B   // high is forward //

// use SD2 for WIFI override //
#define PIN_WIFI_AP_MODE  PIN_D5

Servo weaponESC, servo;

// drive command timeout //
long _lastCommandMillis;

// configure the hardware //
void setupHardware() {
  // motor control pins to output //
  pinMode(PIN_L_PWM, OUTPUT);
  pinMode(PIN_L_DIR, OUTPUT);
  pinMode(PIN_R_PWM, OUTPUT);
  pinMode(PIN_R_DIR, OUTPUT);

  // LED to output //
  pinMode(PIN_LED2, OUTPUT);
  setStatusLED(false);

  // WiFi override //
  pinMode(PIN_WIFI_AP_MODE, INPUT_PULLUP);

  weaponESC.attach(PIN_D6);
  weaponESC.writeMicroseconds(900);
  
  servo.attach(PIN_D7);
  servo.write(90);
}

// get the debugging LED //
bool getStatusLED() {
  return !digitalRead(PIN_LED2);
}

// set the debugging LED //
void setStatusLED(bool active) {
  digitalWrite(PIN_LED2, !active);
}

// is the WiFi forced to AP mode by jumper //
bool getWiFiForceAPMode() {
  return !digitalRead(PIN_WIFI_AP_MODE);
}

// set power to the wheels //
void setWheelPower(int left, int right) {
  left  = constrain(left,  -1023, 1023);
  right = constrain(right, -1023, 1023);

  digitalWrite(PIN_L_DIR, left >= 0);
  digitalWrite(PIN_R_DIR, right >= 0);
  
  analogWrite(PIN_L_PWM, abs(left));
  analogWrite(PIN_R_PWM, abs(right));
}

// set the weapon power //
void setWeaponPower(int power) {
  power = constrain(power, 0, 1023);
  
  int usec = 900 + (power * 900) / 1024;
  weaponESC.writeMicroseconds(usec);
}

// interpret data PUT to the control endpoint //
//  format: "${leftPower}:${rightPower}"
//
//  where:  leftPower  - int [-1023, 1023]
//          rightPower - int [-1023, 1023]
//
//  positive values are forward 
void handleControlPut() {
  enterState(STATE_DRIVING);
  
  String body = server.arg("plain"); // "plain" is the PUT body //
  //DBG_OUTPUT_PORT.println("handleControlPut: " + body);

  int index = body.indexOf(":"), index2 = body.indexOf(":", index + 1);
  int i = body.substring(0, index).toInt();
  int j = (index2 >= 0)? 
    body.substring(index + 1, index2).toInt(): 
    body.substring(index + 1).toInt();  
  int k = (index2 >= 0)? 
    body.substring(index2 + 1).toInt(): 
    0;
  
  //DBG_OUTPUT_PORT.print("i: "); DBG_OUTPUT_PORT.print(i); 
  //DBG_OUTPUT_PORT.print(", j: "); DBG_OUTPUT_PORT.println(j); 

  setWheelPower(i, j);
  setWeaponPower(k);
  
  //int servo2 = 90 + (j * 90) / 1024;
  //DBG_OUTPUT_PORT.print(", s2: "); DBG_OUTPUT_PORT.println(servo2); 
  //testServo2.write(servo2);
  
  server.send(200, "text/plain", "");
  body = String();
}

/********************************************************************************
 * Status State Machine                                                         *
 *  State machine to implement global status handling within firmware. Handles  *
 *  blinking of the status LED as well as the command timeout.                  *
 ********************************************************************************/

#define DRIVE_TIMEOUT  2000  // only drive for 2 seconds w/o connection //

RobotState _state = STATE_START, _lastState;
long _stateDelay, _driveTimeout;

// enter the specified state //
void enterState(RobotState state) {
  switch(state) {
    case STATE_CONNECT:
      setStatusLED(false);
      break;
    case STATE_IDLE:
      setStatusLED(false);
      setWheelPower(0, 0);
      break;
    case STATE_DRIVING:
      _driveTimeout = millis() + DRIVE_TIMEOUT;
      break;
  }
  if(_state != state) {
    DBG_OUTPUT_PORT.print("State: "); DBG_OUTPUT_PORT.println(state);
  }
  _state = state;  
}

// run the state machine //
void runStateMachine() {
  switch(_state) {
    case STATE_START:
      setStatusLED(false);
      break;
    case STATE_SETUP:
      setStatusLED(true);
      break;
    case STATE_CONNECT:
      // fast blink //
      if (millis() > _stateDelay) {
        setStatusLED(!getStatusLED()); // toggle LED //
        _stateDelay = millis() + 100;
      }
      break;
    case STATE_IDLE:
      // chirp blink //
      if (millis() > _stateDelay) {
        setStatusLED(!getStatusLED());
        _stateDelay = millis() + (getStatusLED()? 100: 2000);
      }
      break;
    case STATE_DRIVING:
      // check for timeout, if expired, stop driving //
      if(millis() > _driveTimeout) {
        enterState(STATE_IDLE);
        break;
      }
      // medium blink //
      if (millis() > _stateDelay) {
        setStatusLED(!getStatusLED());
        _stateDelay = millis() + 500;
      }
      break;
  }
}

/********************************************************************************
 * Main Entry Points                                                            *
 *  Configure the hardware, connect to WiFi, start mDNS and setup web server    *
 *  route handling.                                                             *
 ********************************************************************************/

void setup(void){
  // configure debug serial port //
  DBG_OUTPUT_PORT.begin(115200);
  DBG_OUTPUT_PORT.print("\n");
  DBG_OUTPUT_PORT.setDebugOutput(true);

  enterState(STATE_SETUP);
  runStateMachine();
  
  // configure the hardware //
  setupHardware();

  // start file system //
  SPIFFS.begin();

  // start wifi //
  setupWiFi();
  
  // web server control, file browser routes //
  server.on("/list", HTTP_GET, handleFileList);
  server.on("/edit", HTTP_GET, [](){
    if(!handleFileRead("/edit.htm")) server.send(404, "text/plain", "FileNotFound");
  });
  //server.on("/edit", HTTP_PUT, handleFileCreate);
  server.on("/edit", HTTP_DELETE, handleFileDelete);
  server.on("/edit", HTTP_POST, 
    [](){ server.send(200, "text/plain", ""); }, 
    handleFileUpload
  );

  // hardware control routes //
  server.on("/control", HTTP_PUT, handleControlPut);
  
  // use the not-found route to server up arbitrary files //
  server.onNotFound([](){
    if(!handleFileRead(server.uri()))
      server.send(404, "text/plain", "FileNotFound");
  });

  // we're ready //
  server.begin();
  DBG_OUTPUT_PORT.println("HTTP server started");
  enterState(STATE_IDLE);
}
 
void loop(void){
  runStateMachine();
  server.handleClient();
}
