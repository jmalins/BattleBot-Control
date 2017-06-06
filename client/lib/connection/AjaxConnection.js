import Connection from './Connection'
import { ajaxPut } from '../utils'

/**
 * Robot connection implemented with repetitive AJAX PUTs to the robot
 * REST API. In practice, this method is limited to 10-15Hz, but is a lowest
 * common denominator supported by nearly all devices.
 *
 * This class is used by the framework and is configured based on options set
 * in the user interface. Direct use by your code is generally not needed.
 */
export default class AjaxConnection extends Connection {
  /**
   * Constructor.
   *
   * Create an AJAX connection. This connection will continuously poll the
   * robot REST interface at `http://hostname/control` to send control packets.
   *
   * @override
   * @param {number} [timeoutMillis=500] connection timeout in milliseconds
   */
  constructor (timeoutMillis) {
    super()
    /**
     * Connection timeout in milliseconds
     * @type {number}
     */
    this.timeoutMillis = timeoutMillis || 500
    /** @private */
    this.timerId = null
  }

  /**
   *  Poll the robot in a continuous loop.
   *  @private
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

  /**
   *  Start connection to the robot.
   *  @override
   */
  start () {
    this.setState(Connection.CONNECTING)
    super.start()
    this.poll()
  }

  /**
   *  Stop connection to the robot.
   *  @override
   */
  stop () {
    if (this.timerId) clearTimeout(this.timerId)
    super.stop()
    this.setState(Connection.DISCONNECTED)
    this.setResponseData(null)
  }
}
