/* eslint-disable no-unused-vars */
import { Hardware, Motor, Servo, DigitalOutput, DigitalInput } from './hardware'
import { TankDrive, ArcadeDrive } from './drive'
import { Joystick, Button, Slider, ControlManager } from './controls'
import { AjaxConnection, Connection } from './connection'
import { Errors, CONNECTION } from './error'
import { ajaxGet } from './utils'

// configure the ControlManager HTML5 canvas //
const heading = document.getElementById('heading')
const canvas = document.getElementById('touch-canvas')

const resizeCanvas = () => {
  canvas.width = window.outerWidth
  canvas.height = window.outerHeight - heading.clientHeight - 1

  window.scrollTo(0, 0)
}
window.addEventListener('orientationchange', resizeCanvas)
window.addEventListener('resize', resizeCanvas)
resizeCanvas()
ControlManager.setCanvas(canvas)

// set UI connection state //
function setConnectionState (state) {
  console.log('Connection state:', state)
  const statusBox = document.getElementById('status-box')
  switch (state) {
    case Connection.DISCONNECTED:
    case Connection.CONNECTING:
      statusBox.style.backgroundColor = 'yellow'
      break
    case Connection.CONNECTED:
      statusBox.style.backgroundColor = 'green'
      break
    default:
      statusBox.style.backgroundColor = 'red'
      break
  }
  const statusText = document.getElementById('status-text')
  statusText.innerText = state
}

// initialize the application //
const getHardwareConfig = new Promise((resolve, reject) =>
  ajaxGet('./hardware.json', (err, resp) => {
    if (err) {
      reject(err)
      return
    }
    const config = JSON.parse(resp.data)
    console.log('Hardware config loaded', config)
    resolve(config)
  })
)
const waitForLoad = new Promise((resolve, reject) => {
  window.addEventListener('load', () => {
    console.log('Page loaded')
    resolve()
  })
})

let _connection = null
Promise.all([ getHardwareConfig, waitForLoad ])
  .then(([ config ]) => {
    // set hardware configuration //
    Hardware.configure(config)

    if (window.setup) {
      console.log('Running robot setup...')
      window.setup()
    }
    _connection = new AjaxConnection()
    _connection.onstatechange = (newState) => {
      setConnectionState(newState)
      if (newState === Connection.ERROR) {
        Errors.add(CONNECTION, _connection.lastError)
      }
    }
    setConnectionState(_connection.state)
    //_connection.start()

    // start the UI control loop //
    ControlManager.start()
    ControlManager.onupdate = () => {
      // call the loop() method to update virtual hardware //
      if (window.loop) {
        window.loop()
      }
      const request = Hardware.getRequestJSON()
      console.log('request', request)
      _connection.setRobotData(request)
    }
  })
  .catch(err => console.error('Error loading', err))
