/**
 * Base module for control connections. Presents the public API for both
 * sending commands to the robot and querying the connection status.
 *
 * @module connection-base
 */

/* global XMLHttpRequest, WebSocket */

export const CONNECTED = 'CONNECTED'
export const DISCONNECTED = 'DISCONNECTED'
export const TIMEOUT = 'TIMEOUT'

/** Control connection abstract base class */
export class Connection {
  constructor () {
    this.status = DISCONNECTED
    this.enabled = false
    this.leftPower = 0
    this.rightPower = 0
  }

  setEnabled (state) {
    this.enabled = state
  }

  /**
   * Set power to wheels.
   *
   * Values range from -1.0 (full reverse) to 1.0 (full forward). A value of 0
   * is stopped.
   *
   * @param {number} left wheel power [-1.0, 1.0]
   * @param {number} right wheel power [-1.0, 1.0]
   */
  setWheelPower (left, right) {
    if (left < -1.0) left = -1.0
    if (left > 1.0) left = 1.0
    if (right < -1.0) right = -1.0
    if (right > 1.0) right = 1.0

    this.leftPower = left
    this.rightPower = right
    this.update()
  }

  /**
   * Set power/value to an auxially channel.
   *
   * These can be weapon ESCs, servos, or general PWM channels based
   * on how the robot is configured.
   *
   * @param {number} channel number (0..n)
   * @param {number} power [0, 1.0]
   */
  setAuxChannel (channel, power) {

  }

  // base method implemented by subclasses //
  update () {

  }
}

export class AjaxConnection extends Connection {
  /**
   * Constructor.
   *
   * @param {number} connection timeout in milliseconds
   */
  constructor (timeoutMillis = 250) {
    super()
    this.timeoutMillis = timeoutMillis
  }

  setEnabled (state) {
    super.setEnabled(state)
  }

  updateState (event, data) {
    console.log('updateState', event, data)
  }

  send (value) {
    const xhr = new XMLHttpRequest()

    xhr.timeout = this.timeoutMillis
    xhr.open('PUT', '/control', true)
    xhr.onload = (info) => {
      const data = { text: xhr.responseText, status: xhr.status, info }
      switch (xhr.status) {
        case 200:
          this.updateState('success', data)
          break
        default:
          this.updateState('unknown', data)
      }
    }
    xhr.onerror = (info) => {
      this.updateState('error', { text: 'an error occurred', info })
    }
    xhr.ontimeout = (info) => {
      this.updateState('event', { text: 'connected timed out', info })
    }

    xhr.send(value)
  }
}

export class WebSocketConnection extends Connection {

}
