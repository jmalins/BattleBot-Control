/**
 *  Hardware assignments for NodeMCU + Motor Shield module
 *
 *  This info was surprisingly annoying to locate from the various
 *  online sources, mainly because you have ESP8266 pins mapped to 
 *  NodeMCU pins mapped to motor shield / dev board pins.
 **/

// raw GPIO pins //
#define PIN_D0    16    // supports digital read/write only, no PWM, pullup, etc. //
#define PIN_D1    5
#define PIN_D2    4
#define PIN_D3    0
#define PIN_D4    2
#define PIN_D5    14
#define PIN_D6    12
#define PIN_D7    13
#define PIN_D8    15
#define PIN_D9    3
#define PIN_D10   1
#define PIN_D11   9
#define PIN_D12   10

// alternative GPIO pin labels //
#define PIN_RX    PIN_D9
#define PIN_TX    PIN_D10
#define PIN_SD2   PIN_D11
#define PIN_SD3   PIN_D12

// module LEDs (active low) //
#define PIN_LED1  PIN_D4    // near antenna on ESP8266, shared with DIR_B //
#define PIN_LED2  PIN_D0    // on NodeMCU, closer to USB connector //

// motor driver //
#define PIN_PWM_A PIN_D1
#define PIN_DIR_A PIN_D3    // high for forward //
#define PIN_PWM_B PIN_D2
#define PIN_DIR_B PIN_D4    // high for forward //

/**
 * For reference, the motor sheild board also has the following connections.
 **/
//  Shield pin    NodeMCU pin
//   SPI_CLK       CLK
//   SPI_MISO      SDO
//   SPI_MOSI      CMD
//   SPI_INT       SD1
