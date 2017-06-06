/* globals WebSocket */
import Connection from './Connection'

/**
 * Robot connection implemented with a WebSocket. This connection allows
 * for higher update rates, but it requires a modern phone OS / browser.
 *
 * @class
 */
export default class WebSocketConnection extends Connection {
  /**
   * Constructor.
   *
   * @param {?string} hostName hostname to connect to
   */
  constructor (hostName) {
    super()
    const { hostname, port } = document.location
    /** @private */
    this.hostName = hostName || (port !== 80) ? `${hostname}:${port}` : hostname
    /** @private */
    this.socket = null
    /** @private */
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
