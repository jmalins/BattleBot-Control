/* eslint-disable no-unused-vars */
import { Hardware, Motor, Servo, DigitalOutput, DigitalInput } from './hardware'
import { TankDrive, ArcadeDrive } from './drive'
import { Joystick, Button, TouchManager } from './controls'

// set the default hardware configuration    //
// you can call Hardware.configure() in your //
// robot code to override this.              //
import defaultConfig from './default-config'
Hardware.configure(defaultConfig)

// configure the HTML5 canvas //
const heading = document.getElementById('heading')
const canvas = document.getElementById('touch-canvas')

function resizeCanvas () {
  canvas.width = window.outerWidth
  canvas.height = window.outerHeight - heading.clientHeight - 1

  window.scrollTo(0, 0)
}
window.addEventListener('orientationchange', resizeCanvas)
window.addEventListener('resize', resizeCanvas)
resizeCanvas()
TouchManager.setCanvas(canvas)

// initialization routine //
window.addEventListener('load', (e) => {
  console.log('Loaded')
  if (window.setup) {
    console.log('Running setup...')
    window.setup()
  }
  console.log(JSON.parse(Hardware.getConfigurationJSON()), Hardware.devices)

  // start the UI control loop //
  TouchManager.start()
})
