/**
 * Module for configurable control interface. Makes use of an HTML5
 * canvas to paint controls and handle multi-touch events.
 *
 * @module controls
 */
import { Errors, SETUP } from './error'

/**************************************************************
 * TouchManager Implementation                                *
 **************************************************************/

const _touchOwners = { }

function convertTouch (touch) {
  return {
    identifier: touch.identifier,
    clientX: Math.round(touch.clientX - TouchManager.canvas.offsetLeft),
    clientY: Math.round(touch.clientY - TouchManager.canvas.offsetTop),
    force: touch.force
  }
}

function doAdd (touch) {
  if (typeof touch.identifier === 'undefined') touch.identifier = 'mouse'

  // loop through controls and see if one captures the touch //
  for (const controlName in TouchManager.controls) {
    const control = TouchManager.controls[controlName]
    if (control.matchesTouch(touch)) {
      _touchOwners[touch.identifier] = control
      control.touch = convertTouch(touch)
      break
    }
  }

  console.log('touchStart', touch, touch.identifier)
}

function doUpdate (touch) {
  if (typeof touch.identifier === 'undefined') touch.identifier = 'mouse'
  const control = _touchOwners[touch.identifier]
  if (!control) return
  control.touch = convertTouch(touch)
  console.log('touchMove', touch, touch.identifier)
}

function doRemove (touch) {
  if (typeof touch.identifier === 'undefined') touch.identifier = 'mouse'
  const control = _touchOwners[touch.identifier]
  if (!control) return
  control.touch = null
  delete _touchOwners[touch.identifier]
  console.log('touchEnd', touch, touch.identifier)
}

const FRAME_RATE = 35
let _oldWidth
let _oldHeight
export const TouchManager = {
  canvas: null,
  ctx: null,
  intervalID: null,
  controls: { },

  setCanvas (canvas) {
    function handleTouches (e, handler) {
      // prevent scrolling on update //
      if (handler === doUpdate) {
        e.preventDefault()
      }
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

    TouchManager.canvas = canvas
    TouchManager.ctx = canvas.getContext('2d')
  },

  start () {
    TouchManager.intervalID = setInterval(
      () => TouchManager.update(),
      1000 / FRAME_RATE
    )
  },

  stop () {
    if (TouchManager.intervalID) {
      clearInterval(TouchManager.intervalID)
    }
  },

  update () {
    const { canvas, ctx, controls } = TouchManager

    // check for canvas resize //
    const resized = (canvas.width !== _oldWidth || canvas.height !== _oldHeight)
    if (resized) {
      _oldWidth = canvas.width
      _oldHeight = canvas.height
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1
    ctx.fillStyle = 'white'

    ctx.fillText('test ' + new Date(), 10, 10)

    // loop through controls //
    for (const controlName in controls) {
      const control = controls[controlName]
      if (resized) control.pixelCache = null
      control.draw(ctx)
    }
  }
}

function addControl (name, control) {
  if (TouchManager.controls[name]) {
    Errors.add(SETUP, `Control already exists: ${name}`)
    return
  }
  TouchManager.controls[name] = control
}

function convertToPixels (dim, value) {
  // determine the reference dimension based on name //
  let reference
  switch (dim) {
    case 'y':
    case 'height':
      reference = TouchManager.canvas.height
      break
    default:
      reference = TouchManager.canvas.width
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

/**************************************************************
 * Control / Graphics Classes                                 *
 **************************************************************/

/**
 * Base class for all UI controls.
 */
export class Control {
  constructor (name) {
    this.name = name || `control${++Control.count}`
    this.position = { }

    this.touch = null
    this.pixelCache = null
    addControl(name, this)
  }

  /**
   * Implemented by subclasses to determine if they match
   * the specified touch.
   */
  matchesTouch (touch) {
    return false
  }

  /**
   * Overridden by subclasses to add dimensions to be translated
   * into pixels.
   *
   * Don't forget to include 'super.dimensions'
   */
  getDimensions () {
    return { x: this.position.x, y: this.position.y }
  }

  /**
   * Get the control dimensions converted to pixels relative
   * to the current canvas size. This cached for performance reasons.
   */
  getPixelDimensions () {
    if (this.pixelCache) return this.pixelCache
    const dimensions = this.getDimensions()
    const pixels = {}
    for (const dimName in dimensions) {
      pixels[dimName] = convertToPixels(dimName, dimensions[dimName])
    }
    console.log(this.name, pixels)
    return (this.pixelCache = pixels)
  }
}
Control.count = 0

export class Joystick extends Control {
  constructor (name) {
    super(name)
    this.radius = 10
    this.sticky = false
    this.style = 'white'
  }

  get x () {
    if (!this.touch) return 0.0
    const { x, r } = this.getPixelDimensions()
    return (this.touch.clientX - x) / r
  }

  get y () {
    if (!this.touch) return 0.0
    const { y, r } = this.getPixelDimensions()
    return (y - this.touch.clientY) / r
  }

  getDimensions () {
    return { ...super.getDimensions(), r: this.radius }
  }

  matchesTouch (touch) {
    const { clientX, clientY } = touch
    const { x, y, r } = this.getPixelDimensions()

    const dx = (x - clientX)
    const dy = (y - clientY)
    return Math.sqrt(dx * dx + dy * dy) <= r
  }

  draw (ctx) {
    const { x, y, r } = this.getPixelDimensions()

    ctx.beginPath()
    ctx.strokeStyle = (this.touch && this.touchedStyle) || this.style
    ctx.lineWidth = 6
    ctx.arc(x, y, 40, 0, Math.PI * 2, true)
    ctx.stroke()

    ctx.beginPath()
    ctx.strokeStyle = (this.touch && this.touchedStyle) || this.style
    ctx.lineWidth = 2
    ctx.arc(x, y, r, 0, Math.PI * 2, true)
    ctx.stroke()

    // paint the current touch //
    if (this.touch) {
      const { clientX, clientY } = this.touch
      ctx.beginPath()
      ctx.strokeStyle = this.style
      ctx.arc(clientX, clientY, 40, 0, Math.PI * 2, true)
      ctx.stroke()
    }

    ctx.beginPath()
    ctx.fillStyle = 'white'
    ctx.fillText(
      `joystick: ${this.name}, x: ${this.x.toFixed(3)}, y: ${this.y.toFixed(3)}`,
      x - 50, y + 75
    )
  }
}

export class Button extends Control {
  constructor (name) {
    super(name)
    this.radius = 10
    this.sticky = false
    this.style = 'white'
  }

  get pressed () {
    return !!this.touch
  }

  getDimensions () {
    return { ...super.getDimensions(), r: this.radius }
  }

  matchesTouch (touch) {
    const { clientX, clientY } = touch
    const { x, y, r } = this.getPixelDimensions()

    const dx = (x - clientX)
    const dy = (y - clientY)
    return Math.sqrt(dx * dx + dy * dy) <= r
  }

  draw (ctx) {
    const { x, y, r } = this.getPixelDimensions()

    ctx.beginPath()
    ctx.strokeStyle = this.style
    ctx.lineWidth = 6
    ctx.arc(x, y, r, 0, Math.PI * 2, true)
    if (this.pressed) {
      ctx.fill()
    } else {
      ctx.stroke()
    }
  }
}
