import Control from './Control'
import { constrain } from '../utils'

/**
 * Joystick for two dimensional X-Y control.
 *
 * This is the primary tool for controlling the robot. It functions just like a
 * physical joystick, giving readings in both the X and Y directions.
 *
 * @example <caption>Setting Joystick parametes in 'setup()'</caption>
 * var myJoystick = new Joystick('leftStick');
 * myJoystick.position.x = 40;
 * myJoystick.position.y = 50;
 * myJoystick.radius = 15;
 *
 * @example <caption>Reading Joystick value in 'loop()'</caption>
 * var valueX = myJoystick.x;
 * myMotor.set(valueX);
 */
export default class Joystick extends Control {
  /**
   * Constructor. Create a new Joystick and add it to the canvas.
   *
   * @override
   * @param {!string} name - the joystick name
   * @throws {Error} control already exists with specified name
   */
  constructor (name) {
    super(name)
    /**
     * The placement of the Joystick on the canvas. For dimension values,
     * see {@link ControlManager.convertToPixels}.
     *
     * @example <caption>Set individually</caption>
     * myJoystick.position.x = 10;
     * myJoystick.position.y = 20;
     *
     * @example <caption>Set as an Object literal</caption>
     * myJoystick.position = { x: 10, y: 20 };
     *
     * @type {Position}
     */
    this.position = { x: 0, y: 0 }
    /**
     * The radius of the Joystick. Sets the overall size, and therefore
     * sensitivity. Smaller joysticks are more sensitive.
     *
     * @example
     * myJoystick.radius = 10;
     *
     * @type {number}
     */
    this.radius = 10
    /**
     * Should the Joystick reset to zero output when a TouchEvent ends, or
     * continue with the last value. Think of this as "spring return" in a
     * physical Joystick.
     *
     * Defaults to `false`.
     *
     * @example
     * myJoystick.sticky = true;
     *
     * @type {boolean}
     */
    this.sticky = false
    /**
     * Style to draw.
     * @type {string}
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeStyle
     */
    this.style = 'white'

    /**
     * *Output* - The horizontal value of the Joystick. This will be a value between
     * -1.0 (full right) and 1.0 (full left). Idle in the center is 0.0.
     *
     * @example <caption>Get X value</caption>
     * var myValueX = myJoystick.x;
     *
     * @type {!number}
     */
    this.x = 0

    /**
     * *Output* - The vertical value of the Joystick. This will be a value between
     * -1.0 (full down) and 1.0 (full up). Idle in the center is 0.0.
     *
     * @example <caption>Get Y value</caption>
     * var myValueY = myJoystick.y;
     *
     * @type {!number}
     */
    this.y = 0
  }

  /**
   * Get Joystick dimensions.
   *
   * @protected
   * @return {Map<string,number|string>} the dimension collection
   * @property {!(number|string)} x - the x coordinate
   * @property {!(number|string)} y - the y coordinate
   * @property {!(number|string)} r - the radius
   */
  getDimensions () {
    return { x: this.position.x, y: this.position.y, r: this.radius }
  }

  /**
   * Is the specified touch inside the Joystick.
   *
   * This method is called by the framework, so need not be used directly.
   *
   * @override
   * @protected
   * @param {!TouchEvent} touch - the TouchEvent to test
   * @return {boolean} - true if the control matches the event
   */
  matchesTouch (touch) {
    const { clientX, clientY } = touch
    const { x, y, r } = this.getPixelDimensions()

    const dx = (x - clientX)
    const dy = (y - clientY)
    return Math.sqrt(dx * dx + dy * dy) <= r
  }

  /**
   * A touch tracked by the Joystick has been updated. Updates the
   * values of `x` and `y` outputs and handles sticky behavior.
   *
   * This method is called by the framework, so need not be used directly.
   *
   * @override
   * @protected
   * @param {?TouchEvent} touch - the TouchEvent to test
   */
  setTouch (touch) {
    super.setTouch(touch)
    if (touch) {
      const { x, y, r } = this.getPixelDimensions()
      this.x = constrain((x - touch.clientX) / r, -1.0, 1.0)
      this.y = constrain((y - touch.clientY) / r, -1.0, 1.0)
    } else if (!this.sticky) {
      this.x = 0.0
      this.y = 0.0
    }
  }

  /**
   * Draw the Joystick on the canvas.
   *
   * This method is called by the framework, so need not be used directly.
   *
   * @override
   * @protected
   * @param {!CanvasRenderingContext2D} ctx - the 2D drawing context
   */
  draw (ctx) {
    const { x, y, r } = this.getPixelDimensions()
    const ir = Math.round(r / 3)

    ctx.beginPath()
    ctx.strokeStyle = (this.touch && this.touchedStyle) || this.style
    ctx.lineWidth = 5
    ctx.arc(x, y, ir, 0, Math.PI * 2, true)
    ctx.stroke()

    ctx.beginPath()
    ctx.strokeStyle = (this.touch && this.touchedStyle) || this.style
    ctx.lineWidth = 2
    ctx.arc(x, y, r, 0, Math.PI * 2, true)
    ctx.stroke()

    // paint the current touch //
    ctx.beginPath()
    ctx.strokeStyle = this.style
    ctx.arc(x - this.x * r, y - this.y * r, ir, 0, Math.PI * 2, true)
    ctx.stroke()

    ctx.beginPath()
    ctx.fillStyle = 'white'
    ctx.fillText(
      `${this.name}, x: ${this.x.toFixed(3)}, y: ${this.y.toFixed(3)}`,
      x - 50, y + r + 15
    )
  }
}
