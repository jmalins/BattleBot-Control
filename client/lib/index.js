/* eslint-disable no-unused-vars */
import { HardwareManager, Motor, Servo, DigitalOutput, DigitalInput } from './hardware'
import { TankDrive, ArcadeDrive } from './drive'
import { Joystick, Button, Slider, ControlManager } from './controls'
import { AjaxConnection, Connection } from './connection'
import { ajaxGet } from './utils'

// get HTML elements //
const heading = document.getElementById('heading')
const statusIcon = document.getElementById('status-box')
const statusText = document.getElementById('status-text')
const errorBox = document.getElementById('error-box')
const canvas = document.getElementById('touch-canvas')

// configure the ControlManager HTML5 canvas //
const resizeCanvas = () => {
  canvas.width = window.outerWidth
  canvas.height = window.outerHeight - heading.clientHeight - 1

  window.scrollTo(0, 0)
}
window.addEventListener('orientationchange', resizeCanvas)
window.addEventListener('resize', resizeCanvas)
resizeCanvas()
ControlManager.setCanvas(canvas)

// add an error to error box //
function addError ({ type, message }) {
  const eline = document.createElement('li')
  // error type //
  const tspan = document.createElement('span')
  tspan.className = 'type'
  tspan.innerText = type
  eline.appendChild(tspan)
  // error message //
  const mspan = document.createElement('span')
  mspan.className = 'message'
  mspan.innerText = message
  eline.appendChild(mspan)
  errorBox.appendChild(eline)
}

// set UI connection state //
function setConnectionState (state) {
  console.log('Connection state:', state)
  switch (state) {
    case Connection.DISCONNECTED:
    case Connection.CONNECTING:
      statusIcon.style.backgroundColor = 'yellow'
      break
    case Connection.CONNECTED:
      statusIcon.style.backgroundColor = 'green'
      break
    default:
      statusIcon.style.backgroundColor = 'red'
      break
  }
  statusText.innerText = state
}

// initialize the application //
const getHardwareConfig = new Promise((resolve, reject) =>
  ajaxGet('./hardware.json', (err, resp) => {
    if (err) return reject(err)
    resolve(JSON.parse(resp.data))
  })
)
const waitForLoad = new Promise((resolve, reject) => {
  window.addEventListener('load', () => {
    console.log('Page loaded')
    resolve()
  })
})

let _runLoop = true
let _connection = null
Promise.all([ getHardwareConfig, waitForLoad ])
  .then(([ config ]) => {
    // set hardware configuration //
    HardwareManager.config = config

    if (window.setup) {
      console.log('Running robot setup...')
      try {
        window.setup()
      } catch (error) {
        addError({ type: 'SETUP', message: error.message })
      }
    }
    // test hardware config //
    const hwErrors = HardwareManager.validateConfig()
    if (hwErrors) {
      for (let i = 0; i < hwErrors.length; i++) {
        addError(hwErrors[i])
      }
    }

    // establish connection //
    _connection = new AjaxConnection()
    _connection.onstatechange = (newState) => {
      setConnectionState(newState)
      if (newState === Connection.ERROR) {
        console.log(_connection.lastError)
        addError({ type: 'CONNECTION', message: _connection.lastError.message })
      }
    }
    _connection.onresponsedata = (data) => {
      HardwareManager.setInputs(data)
    }

    setConnectionState(_connection.state)
    _connection.start()

    // start the UI control loop //
    ControlManager.start()
    ControlManager.onupdate = () => {
      if (!_runLoop) return

      // call the loop() method to update virtual hardware //
      if (window.loop) {
        try {
          window.loop()
        } catch (error) {
          addError({ type: 'LOOP', message: error.message })
        }
      }
      const request = HardwareManager.getOutputs()
      console.log('request', request)
      _connection.setRobotData(request)
    }
  })
  .catch(err => console.error('Error loading', err))
