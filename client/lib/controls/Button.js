import ControlManager from './ControlManager'
import Control from './Control'

/**
 * Button for on-off control or selecting amongs discrete choices.
 *
 * This class can operate in multiple modes.
 *
 * ## Momentary mode ##
 * In this mode, the button will only register as pressed if it is actively
 * being touched. Once the touch ends, the button is no longer pressed. Physically,
 * this corresponds to spring loaded button. This is the default mode.
 *
 * ```javascript
 * // not actually needed, this is the default mode
 * myButton.sticky = false;
 * ```
 *
 * ## Toggle mode ##
 * In this mode, the button will flip between being pressed and unpressed every
 * time it is touched and released. Physically, this corresponds to a click-on, click-off
 * button.
 *
 * To set this mode, set sticky to `true`.
 * ```javascript
 * myButton.sticky = true;
 * ```
 *
 * ## Group (radio button) mode ##
 * In this mode, buttons are placed into a mutually-exclusive group where only one can
 * be pressed at a time. Physicially, this corresponds to spring-loaded buttons on
 * antique devices such as radios and tape decks.
 *
 * Using this mode requires that the set of buttons be placed in a group. This is done
 * by assigning the same `groupName` property to multiple buttons. Buttons in a group
 * are automatically sticky, so the `sticky` property is ignored.
 * ```javascript
 * myButton1 = new Button('button1');
 * myButton1.groupName = 'myButtons';
 * myButton2 = new Button('button2');
 * myButton2.groupName = 'myButtons';
 * ```
 * By default, the first button that is assigned to a group starts as the initial
 * selected Button. In the example above, this would be `myButton1`. You can change
 * this behavior by manually setting the initial Button to pressed. To make `myButton2`
 * start pressed, do the follow:
 * ```javascript
 * myButton2.pressed = true;
 * ```
 */
export default class Button extends Control {
  /**
   * Constructor. Create a Button and add it to the canvas.
   * @override
   * @param {!string} name - the joystick name
   * @throws {Error} control already exists with specified name
   */
  constructor (name) {
    super(name)
    /**
     * The placement of the Button on the canvas. For dimension values,
     * see {@link ControlManager.convertToPixels}.
     *
     * @example <caption>Set individually</caption>
     * myButton.position.x = 10;
     * myButton.position.y = 20;
     *
     * @example <caption>Set as an Object literal</caption>
     * myButton.position = { x: 10, y: 20 };
     *
     * @type {Position}
     */
    this.position = { x: 0, y: 0 }
    /**
     * The radius of the Button. Bigger buttons are easier to push, but
     * the take up more space. In other news, the sky is blue.
     *
     * @example
     * myJoystick.radius = 10;
     *
     * @type {number}
     */
    this.radius = 10
    /**
     * Should the button stay pressed until touched again to turn off. This value
     * is ignored if the button is part of a group.
     *
     * Defaults to `false`.
     *
     * @type {boolean}
     */
    this.sticky = false
    /**
     * Set this property to the same value on multiple Buttons to make them part of
     * a group. Buttons in a group are mutually exclusive, only one can be pressed
     * at a time.
     * @type {?string}
     */
    this.groupName = null
    /**
     * Style to draw.
     * @type {string}
     */
    this.style = 'white'
    /**
     * *Output* - True if the Button is pressed.
     * @type {boolean}
     */
    this.pressed = false
  }

  /**
   * Get Button dimensions.
   *
   * @protected
   * @return {Map<string,number|string>} named dimension collection, in raw form
   * @property {!(number|string)} x - the x coordinate
   * @property {!(number|string)} y - the y coordinate
   * @property {!(number|string)} r - the radius
   */
  getDimensions () {
    return { x: this.position.x, y: this.position.y, r: this.radius }
  }

  /**
   * Is the specified touch inside the Button.
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
   * A touch tracked by the Button has been updated. Buttons only respond
   * to first instance of a TouchEvent (start) and the call where the TouchEvent
   * is cleared to null (end). The exact behavior depends on the setting of
   * {@link Button#sticky} and {@link Button#groupName}.
   *
   * This method is called by the framework, so need not be used directly.
   *
   * @override
   * @protected
   * @param {?TouchEvent} touch - the TouchEvent to test
   */
  setTouch (touch) {
    const lastState = !!this.touch
    console.log(this.sticky, this.touch, lastState, touch, this.pressed)
    super.setTouch(touch)
    if (this.sticky || this.groupName) {
      // only react to touchStart //
      if (touch && !lastState) {
        // are we part of a group //
        if (this.groupName) {
          // only react to changed values //
          if (!this.pressed) {
            // clear all others in group //
            for (const controlName in ControlManager.controls) {
              const control = ControlManager.controls[controlName]
              if (control instanceof Button && control.groupName === this.groupName) {
                control.pressed = false
              }
            }
            this.pressed = true
          }
        } else {
          // just toggle this button //
          this.pressed = !!(this.pressed ^ true)
        }
      }
    } else {
      this.pressed = !!touch
    }
  }

  /**
   * Draw the Button on the canvas.
   *
   * This method is called by the framework, so need not be used directly.
   *
   * @protected
   * @param {!CanvasRenderingContext2D} ctx - the 2D drawing context
   */
  draw (ctx) {
    const { x, y, r } = this.getPixelDimensions()

    ctx.beginPath()
    ctx.strokeStyle = this.style
    ctx.fillStyle = this.style
    ctx.lineWidth = 6
    ctx.arc(x, y, r, 0, Math.PI * 2, true)
    if (this.pressed) {
      ctx.fill()
    } else {
      ctx.stroke()
    }

    ctx.beginPath()
    ctx.fillStyle = 'white'
    ctx.fillText(
      `${this.name}, pressed: ${this.pressed}`,
      x - 50, y + r + 15
    )
  }
}
