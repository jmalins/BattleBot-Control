import Button from './Button'

// constants //
const FRAME_RATE = 30

// internal state //
const _touchOwners = { }
const _controls = { }
let _canvas = null
let _context = null
let _intervalID = null
let _oldWidth = 0
let _oldHeight = 0

/**
 * Event wrapper to unify multi-touch and mouse events.
 * @protected
 *
 * @typedef {Object} TouchEvent
 * @property {!string} identifer unique identifier (from DOM for multi-touch, 'mouse' if from mouse)
 * @property {!number} clientX the X position in pixels, relative to canvas origin (top left)
 * @property {!number} clientY the Y position in pixles, relative to canvas origin (top left)
 * @property {number} [force] the force of the touch, null for mouse
 */

/**
 * Transforms DOM touch (or mouse) event to pixel coordinates relative to
 * the canvas. This is needed because the coordinates are relative to the
 * screen. Need to subtract the canvas position to compensate.
 *
 * @param {Object} touch the DOM touch event
 * @return {TouchEvent}
 */
function transformTouch (touch) {
  return {
    identifier: touch.identifier,
    clientX: Math.round(touch.clientX - _canvas.offsetLeft),
    clientY: Math.round(touch.clientY - _canvas.offsetTop),
    force: touch.force
  }
}

/**
 * Attempt to process a new touch event. Queries all controls for
 * for first one that responds true to @link Control#matchesTouch.
 *
 * The first match captures the touch and will receive all updates
 * through the @link Control#setTouch call.
 *
 * @param {Object} touch the DOM touch event
 */
function doAdd (touch) {
  if (typeof touch.identifier === 'undefined') touch.identifier = 'mouse'
  touch = transformTouch(touch)

  // loop through controls and see if one captures the touch //
  for (const controlName in ControlManager.controls) {
    const control = ControlManager.controls[controlName]
    if (control.matchesTouch(touch)) {
      _touchOwners[touch.identifier] = control
      control.setTouch(touch)
      fireUpdate()
      break
    }
  }
}

/**
 * If the specified touch has been captured, funnel it to the
 * @link Control#setTouch method of the owner control.
 *
 * @param {Object} touch the DOM touch event
 */
function doUpdate (touch) {
  if (typeof touch.identifier === 'undefined') touch.identifier = 'mouse'
  const control = _touchOwners[touch.identifier]
  if (!control) return
  control.setTouch(transformTouch(touch))
  fireUpdate()
}

/**
 * If the specified touch has been captured, signal the capturing control
 * that it has ended by passing null to @line Control#setTouch.
 *
 * @param {Object} touch the DOM touch event
 */
function doRemove (touch) {
  if (typeof touch.identifier === 'undefined') touch.identifier = 'mouse'
  const control = _touchOwners[touch.identifier]
  if (!control) return
  control.setTouch(null)
  delete _touchOwners[touch.identifier]
  fireUpdate()
}

/**
 * Fire the update event, if one is defined.
 */
function fireUpdate () {
  const { onupdate } = ControlManager
  if (typeof onupdate === 'function') {
    onupdate()
  }
}

/**
 * Loop through each {@link Control} and paint it to the canvas.
 */
function drawControls () {
  // check for canvas resize //
  const resized = (_canvas.width !== _oldWidth || _canvas.height !== _oldHeight)
  if (resized) {
    _oldWidth = _canvas.width
    _oldHeight = _canvas.height
  }

  _context.clearRect(0, 0, _canvas.width, _canvas.height)

  // loop through controls //
  for (const controlName in _controls) {
    const control = _controls[controlName]
    if (resized) control.pixelCache = null
    control.draw(_context)
  }
}

/**
 * Manages the display canvas, processing touch events and painting of
 * all user-created controls.
 *
 * The class is part of the core framework infrastructure and should not be
 * needed in your code under most circumstances.
 *
 * @protected
 */
export default class ControlManager {
  /**
   * All declared {@link Control} instances, keyed by control name.
   *
   * @type {Map<string,Control>}
   */
  static get controls () {
    return _controls
  }

  /**
   * Initialize the ControlManager with the specified HTML5 canvas object.
   *
   * This method will attach the relevant event listeners to monitor the canvas
   * for touch and mouse events.
   *
   * @protected
   * @param {!HTMLElement} canvas the canvas element
   */
  static setCanvas (canvas) {
    /**
     * Split all multi-touches in a touch event to discrete calls.
     */
    function handleTouches (e, handler) {
      // prevent scrolling and mouse fallthrough on desktop //
      e.preventDefault()
      // loop through touches //
      for (let i = 0; i < e.changedTouches.length; i++) {
        handler(e.changedTouches[i])
      }
    }

    canvas.addEventListener('touchstart', (e) => handleTouches(e, doAdd), false)
    canvas.addEventListener('touchmove', (e) => handleTouches(e, doUpdate), false)
    canvas.addEventListener('touchend', (e) => handleTouches(e, doRemove), false)

    canvas.addEventListener('mousedown', doAdd, false)
    canvas.addEventListener('mousemove', doUpdate, false)
    canvas.addEventListener('mouseup', doRemove, false)

    _canvas = canvas
    _context = canvas.getContext('2d')
  }

  /**
   * Start control process and canvas updates.
   * @protected
   */
  static start () {
    // handle default values of button groups //
    const buttonGroups = { }
    for (const controlName in _controls) {
      const control = _controls[controlName]
      if (control instanceof Button && control.groupName) {
        const { groupName } = control
        if (buttonGroups[groupName]) {
          buttonGroups[groupName].push(control)
        } else {
          buttonGroups[groupName] = [ control ]
        }
      }
    }
    for (const groupName in buttonGroups) {
      const buttons = buttonGroups[groupName]
      // if user has not set a default pressed button, select first //
      if (!buttons.some(button => button.pressed)) {
        buttons[0].pressed = true
      }
    }

    // start painting //
    _intervalID = setInterval(() => drawControls(), 1000 / FRAME_RATE)
  }

  /**
   * Stop control processing and canvas updates.
   * @protected
   */
  static stop () {
    if (_intervalID) {
      clearInterval(_intervalID)
      _intervalID = null
    }
  }

  /**
   * Converts a flexible dimension string pixels for use on the canvas.
   *
   * This method supports multiple different formats.
   * @example
   * control.dimension = 50     // 50% of the height or width, depending on context
   * control.dimension = '50%'  // same as above
   * control.dimension = '20px' // pixels specified directly, only good for one screen size
   *
   * @param {!string} dim - the name of the dimension ('x', 'height', etc.)
   * @param {!(number|string)} value - raw dimension value, any format
   * @return {number} result in pixels
   */
  static convertToPixels (dim, value) {
    // determine the reference dimension based on name //
    let reference
    switch (dim) {
      case 'y':
      case 'height':
        reference = _canvas.height
        break
      default:
        reference = _canvas.width
        break
    }

    // handle based on type //
    switch (typeof value) {
      case 'number':
        // if a fraction, assume a percent //
        if (value > 0 && value < 1.0) {
          value *= 100
        }
        return Math.round(value * reference / 100)
      case 'string':
        const matches = value.match(/^([0-9]+)([^0-9]*)$/)
        if (matches) {
          const [ , num, unit ] = matches
          value = parseInt(num)
          switch (unit) {
            case '%':
            case '':
              return Math.round(value * reference / 100)
            case 'px':
              return value
          }
        }
        // fallthrough //
      default:
        return null
    }
  }

  /**
   * Add a new {@link Control} to the ControlManager. This method
   * is called automatically by the {@link Control} constructor.
   *
   * @private
   * @param {!Control} control - the control
   * @throws {Error} control with that name already exists
   */
  static registerControl (control) {
    const name = control.name
    if (_controls[name]) {
      throw new Error(`Control already exists: ${name}`)
    }
    _controls[name] = control
  }
}
