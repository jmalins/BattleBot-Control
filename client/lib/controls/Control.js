import ControlManager from './ControlManager'

// internal state //
let _controlCount = 0

/**
 * An object representing the position of the a {@link Control} on the
 * canvas.
 *
 * @typedef {Object} Position
 * @property {!(number|string)} x - the x position
 * @property {!(number|string)} y - the y position
 */

/**
 * Abstract base class for all UI controls.
 *
 * Extend this class to implement your own UI controls. In most code, this
 * will not be needed.
 *
 * @abstract
 */
export default class Control {
  /**
   * Constructor.
   *
   * Create a control with the specified name. If no name is supplied, a
   * name will be generated of the form `control####`, where `####` is a
   * sequential integer.
   *
   * Note that control names must be unique. If a control by the same name
   * already exists, an initialization exception will be thrown.
   *
   * @protected
   * @param {string} name - the control name
   * @throws {Error} control already exists with specified name
   */
  constructor (name) {
    /**
     * The control name
     * @type {string}
     */
    this.name = name || `control${++_controlCount}`
    /**
     * The currently tracked {@link TouchEvent}, or null if no event is being
     * tracked by this control.
     *
     * @protected
     * @type {TouchEvent}
     */
    this.touch = null
    /** @private */
    this.pixelCache = null
    ControlManager.registerControl(this)
  }

  /**
   * Determine if the Control matches the specified {@link TouchEvent}.
   *
   * This method will generally contain computation geometry code that
   * compares the input TouchEvent coordinates to the bounds of the {@link Control}.
   *
   * @abstract
   * @protected
   * @param {!TouchEvent} touch - the TouchEvent to test
   * @return {boolean} - true if the control matches the event
   */
  matchesTouch (touch) {
    return false
  }

  /**
   * Called by the {@link ControlManager} when the control is tracking a TouchEvent.
   * A Control begins tracking by returning true from {@link Control#matchesTouch}).
   *
   * Should be overridden by subclasses to update any internal state or outputs
   * that are dependent on the latest touch.
   *
   * Will be passed `null` to indicate that the tracked TouchEvent has ended.
   *
   * @protected
   * @param {?TouchEvent} touch - the TouchEvent to test
   */
  setTouch (touch) {
    this.touch = touch
  }

  /**
   * Returns a map of all important coordinates used by this control. The values
   * are in the raw, polymorphic form, see {@link ControlManager.convertToPixels}
   *
   * This allows the base class to manage the conversion to pixels and cache the
   * complete result for performance / frame rate reasons.
   *
   * @abstract
   * @protected
   * @return {Map<string,number|string>} named dimension collection, in raw form
   */
  getDimensions () {
    return { }
  }

  /**
   * Get the control dimensions converted to pixels relative
   * to the current canvas size. This cached for performance reasons.
   *
   * @protected
   * @returns {Map<string,number>} named dimension collection, in pixels
   */
  getPixelDimensions () {
    if (this.pixelCache) return this.pixelCache
    const dimensions = this.getDimensions()
    const pixels = {}
    for (const dimName in dimensions) {
      pixels[dimName] = ControlManager.convertToPixels(dimName, dimensions[dimName])
    }
    return (this.pixelCache = pixels)
  }

  /**
   * Draw the Control on the canvas.
   *
   * @abstract
   * @protected
   * @param {!CanvasRenderingContext2D} ctx - the 2D drawing context
   */
  draw (ctx) {

  }
}
