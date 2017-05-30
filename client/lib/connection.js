/**
 * Base module for control connections. Presents the public API for both
 * sending commands to the robot and querying the connection status.
 *
 * @module connection-base
 */

/* global WebSocket */
import { ajaxPut } from './utils'

/**
 * Base interface for connection to robot. This hides the differences
 * between the AJAX and WebSocket communication modes.
 *
 * Implements a buffered asynchronous connection. External sources should
 * call setRobotData() whenever new data is available. It will be sent to the robot
 * at the fasted rate the connection will allow.
 */
export class Connection {
  constructor () {
    this.state = Connection.DISCONNECTED
    this.enabled = false
    // response information //
    this.lastError = null
    this.responseData = null
    this.pingTimeMs = null
    // event handlers //
    this.onstatechange = null
    this.onresponsedata = null
  }

  start () {
    this.enabled = true
  }

  stop () {
    this.enabled = false
  }

  /**
   * Update the connection state and notify listeners.
   */
  setState (newState) {
    if (newState === this.state) return
    const oldState = this.state
    this.state = newState

    // notify listener //
    if (typeof this.onstatechange === 'function') {
      this.onstatechange(newState, oldState)
    }
  }

  setRobotData (data) {
    this.dataPacket = (typeof data === 'string') ? data : JSON.stringify(data)
  }

  getResponseData () {
    return this.responseData
  }

  setResponseData (data) {
    this.responseData = data
    if (!data) {
      this.pingTimeMs = null
    }
    // notify listener //
    if (typeof this.onresponsedata === 'function') {
      this.onresponsedata(data)
    }
  }
}
Connection.CONNECTED = 'Connected'
Connection.CONNECTING = 'Connecting'
Connection.DISCONNECTED = 'Disconnected'
Connection.ERROR = 'Error'

/**
 * Robot connection implemented with repetitive AJAX PUTs. In
 * practice, this method is limited to 10-15Hz, but is a lowest
 * common denominator supported by nearly all devices.
 */
export class AjaxConnection extends Connection {
  /**
   * Constructor.
   *
   * @param {number} connection timeout in milliseconds
   */
  constructor (timeoutMillis) {
    super()
    this.timeoutMillis = timeoutMillis || 500
    this.timerId = null
  }

  /**
   *  Poll the robot in a continuous loop.
   */
  poll () {
    const pollStartMs = new Date().getTime()
    ajaxPut('/control?body=' + this.dataPacket, this.dataPacket, this.timeoutMillis, (err, res) => {
      // was the loop terminated? //
      this.lastError = err
      if (this.state === Connection.DISCONNECTED) {
        this.setResponseData(null)
        return
      }

      // handle response //
      if (!this.lastError) {
        if (this.state !== Connection.CONNECTED) {
          this.setState(Connection.CONNECTED)
        }
        this.pingTimeMs = new Date().getTime() - pollStartMs
        this.setResponseData(res.data)
      } else {
        this.setState(Connection.ERROR)
        this.setResponseData(null)
      }

      // poll again //
      const pollMs = (this.state === Connection.ERROR) ? 1000 : 50 // back off if error //
      this.timerId = setTimeout(this.poll.bind(this), pollMs)
    })
  }

  start () {
    this.setState(Connection.CONNECTING)
    super.start()
    this.poll()
  }

  stop () {
    if (this.timerId) clearTimeout(this.timerId)
    super.stop()
    this.setState(Connection.DISCONNECTED)
    this.setResponseData(null)
  }
}

/**
 * Robot connection implemented with a WebSocket. This connection allows
 * for higher update rates, but it requires a modern phone OS / browser.
 */
export class WebSocketConnection extends Connection {
  /**
   * Constructor.
   *
   * @param {number} connection timeout in milliseconds
   */
  constructor (hostName) {
    super()
    const { hostname, port } = document.location
    this.hostName = hostName || (port !== 80) ? `${hostname}:${port}` : hostname
    this.socket = null
    this.startTimeMs = null
  }

  start () {
    this.setState(Connection.CONNECTING)
    super.start()

    this.startTimeMs = new Date().getTime()
    this.socket = new WebSocket(`ws://${this.hostName}/ws`, [ 'arduino' ])
    this.socket.onopen = () => {
      this.setState(Connection.CONNECTED)
    }
    this.socket.onerror = (err) => {
      this.lastError = err
      this.setState(Connection.ERROR)
      this.setResponseData(null)
    }
    this.socket.onmessage = (event) => {
      // compute update rate //
      this.pingTimeMs = new Date().getTime() - this.startTimeMs

      this.setResponseData(event.data)
    }
    this.socket.onclose = (event) => {
      if (this.state !== Connection.ERROR) {
        this.lastError = new Error('Connection lost')
        this.setState(Connection.ERROR)
        this.setResponseData(null)
        this.socket = null
      }
    }
  }

  stop () {
    if (this.socket) {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.close()
      }
      this.setResponseData(null)
      this.socket = null
    }
    super.stop()
    this.setState(Connection.DISCONNECTED)
  }

  setRobotData (data) {
    super.setRobotData(data)

    // send an update //
    if (this.socket && this.state === Connection.CONNECTED) {
      // verify WebSocket state //
      if (this.socket.readyState !== WebSocket.OPEN) {
        this.lastError = new Error(`Invalid socket state: ${
            (this.socket.readyState === WebSocket.CONNECTING) ? 'CONNECTING'
          : (this.socket.readyState === WebSocket.CLOSING) ? 'CLOSING'
          : (this.socket.readyState === WebSocket.CLOSED) ? 'CLOSED'
          : 'UNKNOWN'
        }`)
        this.setState(Connection.ERROR)
        return
      }
      try {
        this.startTimeMs = new Date().getTime()
        this.socket.send(this.dataPacket)
      } catch (err) {
        this.lastError = err
        this.setState(Connection.ERROR)
        this.setResponseData(null)
      }
    }
  }
}
