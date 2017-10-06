/* 
  Cardboard BattleBot Control Firmware
  Copyright (c) 2016-17 Jeff Malins. All rights reserved.
  
*/

#include <ESP8266WiFi.h>
#include <ESP8266mDNS.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <FS.h>
#include <SPIFFSEditor.h>

#include <stdlib.h>
#include <Servo.h>

#include "NodeMCU-Hardware.h"
#include "animals.h"

/********************************************************************************
 * Network Configuration                                                        *
 ********************************************************************************/
 
#define HTTP_PORT       80
#define HOST_NAME       "battlebot"
#define AP_SSID_BASE    "robot-"
#define USE_ANIMAL      true

/********************************************************************************
 * Globals                                                                      *
 ********************************************************************************/

// set to true to print commands to the serial monitor for debugging //
#define PRINT_TO_SERIAL_MONITOR  false

// states //
enum RobotState {
  STATE_START = 1,
  STATE_SETUP,
  STATE_CONNECT,
  STATE_IDLE,
  STATE_DRIVING,
  STATE_DRIVING_WITH_TIMEOUT
};

// function prototypes //
void enterState(RobotState);
void runStateMachine(void);
void updateHardware(String);
bool getWiFiForceAPMode();

#define DBG_OUTPUT_PORT Serial
#define DBG_BAUD_RATE   115200

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
    if(USE_ANIMAL) {
      // lookup an animal from table based on MAC bytes //
      int animalNum = (mac[5] << 8 | mac[4]) % ANIMAL_COUNT;
      ssid += FPSTR(ANIMAL_TABLE[animalNum]);
    } else {
      // use MAC address in hex //
      for(int i = 5; i >= 0; i--) {
        ssid += String(mac[i], HEX);
      }
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
  MDNS.addService("http", "tcp", HTTP_PORT);
  
  DBG_OUTPUT_PORT.print("Open http://");
  DBG_OUTPUT_PORT.print(HOST_NAME);
  DBG_OUTPUT_PORT.println(".local/ to access user interface");
}

/********************************************************************************
 * REST Event Handler                                                           *
 *  Respond to REST interface from the client.                                  *
 ********************************************************************************/
 
void handleControlPut(AsyncWebServerRequest *request) {
  /*DBG_OUTPUT_PORT.println("START control put");
  int parms = request->params();
  for(int i = 0; i < parms; i++) {
    AsyncWebParameter* p = request->getParam(i);
    DBG_OUTPUT_PORT.println("  param: " + p->name() + " " + p->value());
  }
  DBG_OUTPUT_PORT.println("END control put");*/
  
  // should have a POST body //
  if(request->hasParam("body")) {
    enterState(STATE_DRIVING_WITH_TIMEOUT);
    
    String body = request->getParam("body")->value();
    //DBG_OUTPUT_PORT.println("handleControlPut: " + body);

    int index = body.indexOf(":"), index2 = body.indexOf(":", index + 1);
    int i = body.substring(0, index).toInt();
    int j = (index2 >= 0)? 
      body.substring(index + 1, index2).toInt(): 
      body.substring(index + 1).toInt();  
    int k = (index2 >= 0)? 
      body.substring(index2 + 1).toInt(): 
      0;
  
    setWheelPower(i, j);
    setWeaponPower(k);
      
    request->send(200, "text/plain", "ok");
  } else {
    request->send(400);
  }  
}

/********************************************************************************
 * WebSocket Event Handler                                                      *
 *  Implement the WebSocket interface. These functions handle connect,          *
 *  disconnect and data packets from the client.                                *
 ********************************************************************************/

// websocket server instance //
AsyncWebSocketClient *_activeClient;

void onWSEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
  switch(type) {
    case WS_EVT_CONNECT:
      // we connected, print debug message //
      {
        IPAddress ip = client->remoteIP();
        DBG_OUTPUT_PORT.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", client->id(), ip[0], ip[1], ip[2], ip[3], server->url());
      }
      // send success message to client //
      client->printf("Connected: %u", client->id());
      client->ping();
      // enable driving //
      _activeClient = client;
      enterState(STATE_DRIVING_WITH_TIMEOUT);
      setWheelPower(0, 0);
      setWeaponPower(0);
      break;
    case WS_EVT_DISCONNECT:
      DBG_OUTPUT_PORT.printf("[%u] Disconnected!\n", client->id());
      _activeClient = NULL;
      enterState(STATE_IDLE);
      break;
    case WS_EVT_ERROR:
      DBG_OUTPUT_PORT.printf("ws[%s][%u] error(%u): %s\n", server->url(), client->id(), *((uint16_t*) arg), (char*) data);
      break;
    case WS_EVT_PONG:
      DBG_OUTPUT_PORT.printf("ws[%s][%u] pong[%u]: %s\n", server->url(), client->id(), len, (len)? (char*)data: "");
      break;
    case WS_EVT_DATA:
      AwsFrameInfo * info = (AwsFrameInfo*) arg;
      // only handle a single data packet, for now //
      if(info->final && info->index == 0 && info->len == len) {
        if(info->opcode == WS_TEXT) {
          data[len] = 0;
          //DBG_OUTPUT_PORT.printf("[%u] command: %s\n", client->id(), data);
          {
            enterState(STATE_DRIVING_WITH_TIMEOUT);
  
            String cmd((char *) data);
            updateHardware(cmd);
          }
        }
      }
      break;
  }
}

// set a message to the active web socket //
// used for heartbeat to client app       //
void webSocketMessage(String msg) {
  if(!_activeClient) return;
  //DBG_OUTPUT_PORT.printf("[%u] send message: %s\n", _activeClient->id(), msg.c_str());
  _activeClient->text(msg.c_str());
}

/********************************************************************************
 * Hardware Control                                                             *
 *  Handle control of robot hardware based on calls to the web API.             *
 ********************************************************************************/

// map motor driver channels //
#define PIN_R_PWM   PIN_PWM_A   // A is right      //
#define PIN_R_DIR   PIN_DIR_A   // high is forward //

#define PIN_L_PWM   PIN_PWM_B   // B is left       //
#define PIN_L_DIR   PIN_DIR_B   // high is forward //

// use D5 for WIFI override //
#define PIN_WIFI_AP_MODE  PIN_D5

// use D6 for weapon ESC //
#define PIN_WEAPON_ESC  PIN_D6
#define ESC_MIN_USEC    900
#define ESC_MAX_USEC    1800

Servo weaponESC;

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

  weaponESC.attach(PIN_WEAPON_ESC);
  weaponESC.writeMicroseconds(ESC_MIN_USEC);
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

  if(PRINT_TO_SERIAL_MONITOR) {
    DBG_OUTPUT_PORT.printf("left: %d, right: %d", left, right);
  }
  
  digitalWrite(PIN_L_DIR, left >= 0);
  digitalWrite(PIN_R_DIR, right >= 0);
  
  analogWrite(PIN_L_PWM, abs(left));
  analogWrite(PIN_R_PWM, abs(right));
}

// set the weapon power //
void setWeaponPower(int power) {  
  if(PRINT_TO_SERIAL_MONITOR) {
    DBG_OUTPUT_PORT.printf(", weapon: %d\n", power);
  }
  int usec = map(power, 0, 1023, ESC_MIN_USEC, ESC_MAX_USEC);
  weaponESC.writeMicroseconds(usec);
}

// interpret a command string //
//  format: "${leftPower}:${rightPower}(:${weaponPower})?"
//
//  where:  leftPower   - int [-1023, 1023]
//          rightPower  - int [-1023, 1023]
//          weaponPower - int [-1023, 1023] (optional)
//
//  positive values are forward 
void updateHardware(String cmd) {
  int index = cmd.indexOf(":"), index2 = cmd.indexOf(":", index + 1);
  int leftPower  = cmd.substring(0, index).toInt();
  int rightPower = (index2 >= 0)? 
    cmd.substring(index + 1, index2).toInt(): 
    cmd.substring(index + 1).toInt();  
  int weaponPower = (index2 >= 0)? 
    cmd.substring(index2 + 1).toInt(): 
    0;
  
  setWheelPower(leftPower, rightPower);
  setWeaponPower(weaponPower);
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
      setWeaponPower(0);
      break;
    case STATE_DRIVING_WITH_TIMEOUT:
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
    case STATE_DRIVING_WITH_TIMEOUT:
      // check for timeout, if expired, stop driving //
      if(millis() > _driveTimeout) {
        enterState(STATE_IDLE);
        break;
      }
      // note: fall-through here //
    case STATE_DRIVING:
      // medium blink //
      if (millis() > _stateDelay) {
        setStatusLED(!getStatusLED());
        _stateDelay = millis() + 500;
        
        // send heartbeat back to client //
        webSocketMessage("heartbeat");
      }
      break;
  }
}

/********************************************************************************
 * Main Entry Points                                                            *
 *  Configure the hardware, connect to WiFi, start mDNS and setup web server    *
 *  route handling.                                                             *
 ********************************************************************************/

// web server instance //
AsyncWebServer server(HTTP_PORT);
AsyncWebSocket ws("/ws");

void setup(void){
  // configure debug serial port //
  DBG_OUTPUT_PORT.begin(DBG_BAUD_RATE);
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

  // attach WebSocket interface //
  ws.onEvent(onWSEvent);
  server.addHandler(&ws);

  // attach REST interface //
  server.on("/control", HTTP_PUT, handleControlPut);

  // serve static file system //
  server
    .serveStatic("/", SPIFFS, "/")
    .setDefaultFile("index.html");
  
  // file system editor //
  server.addHandler(new SPIFFSEditor());

  // 404'd! //
  server.onNotFound([](AsyncWebServerRequest *request){
    request->send(404);
  });
  
  // we're ready //
  server.begin();
  DBG_OUTPUT_PORT.println("HTTP server started");
  enterState(STATE_IDLE);
}
 
void loop(void){
  runStateMachine();
}
