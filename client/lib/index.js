/* eslint-disable no-unused-vars */
import { HardwareManager, Motor, Servo, DigitalOutput, DigitalInput } from './hardware'
import { TankDrive, ArcadeDrive } from './drive'
import { Joystick, Button, Slider, ControlManager } from './controls'
import { AjaxConnection, WebSocketConnection, Connection } from './connection'
import { ajaxGet } from './utils'

// get HTML elements //
const heading = document.getElementById('heading')
const statusIcon = document.getElementById('status-box')
const statusText = document.getElementById('status-text')
const infoBox = document.getElementById('info-box')
const errorBox = document.getElementById('error-box')
const canvas = document.getElementById('touch-canvas')

// configure the ControlManager HTML5 canvas //
const resizeCanvas = () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight - heading.clientHeight - 1

  window.scrollTo(0, 0)
}
window.addEventListener('orientationchange', resizeCanvas)
window.addEventListener('resize', resizeCanvas)
resizeCanvas()
ControlManager.setCanvas(canvas)

// add an error to error box //
function addError ({ type, message }) {
  const eline = document.createElement('li')
  eline.className = type
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

function clearErrors (type) {
  const els = type
    ? errorBox.getElementsByClassName(type)
    : errorBox.getElementByTagName('ul')
  for (let i = 0; i < els.length; i++) {
    els[i].remove()
  }
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

function setConnectionInfo (conn) {
  infoBox.innerText = `Ping: ${
    (conn.pingTimeMs !== null) ? `${conn.pingTimeMs} ms` : '----'
  }`
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

const WEBSOCKET = true
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
    _connection = WEBSOCKET ? new WebSocketConnection() : new AjaxConnection()
    _connection.onstatechange = (newState, oldState) => {
      setConnectionState(newState)
      if (newState === Connection.ERROR) {
        console.log(_connection.lastError)
        addError({ type: 'CONNECTION', message: _connection.lastError.message })
      } else if (oldState === Connection.ERROR) {
        clearErrors('CONNECTION')
      }
    }
    _connection.onresponsedata = (data) => {
      HardwareManager.setInputs(data)
      setConnectionInfo(_connection)
    }
    // initialize UI //
    setConnectionState(_connection.state)
    // initialize control data //
    _connection.setRobotData(getPacket(HardwareManager.getOutputs()))
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
      const request = getPacket(HardwareManager.getOutputs())
      // console.log('request', request)
      _connection.setRobotData(request)
    }
  })
  .catch(err => {
    addError({ type: 'SCRIPT', message: err.message })
  })

// FIXME: get the ghetto-packet for legacy firmware //
function getPacket (json) {
  return `${json.leftMotor}:${json.rightMotor}:${json.weaponMotor}`
}
