
// import { Errors, SETUP } from './error'

function _toPixels (value, ref) {
  return value
}

class Position {
  constructor (x, y) {
    this.xPixels = x
    this.yPixels = y
  }

  get x () {
    return this.xPixels
  }
  set x (value) {
    this.xPixels = _toPixels(value, 'width')
  }

  get y () {
    return this.yPixels
  }
  set y (value) {
    this.yPixels = _toPixels(value, 'height')
  }
}

export class Control {
  constructor (name) {
    this.name = name
    this.position = new Position(0, 0)
    this.touch = null
  }

  matchesTouch (touch) {
    return false
  }

  captureTouch (touch) {
    if (this.matchesTouch) {
      this.touch = touch
      return true
    }
    return false
  }

  clearTouch () {
    this.touch = null
  }
}

export class Joystick extends Control {
  constructor (name) {
    super(name)
    this.r = _toPixels(10)
    this.sticky = false
    this.style = 'white'
  }

  get x () {
    if (!this.touch) return 0.0
    return (this.position.x - this.touch.currentPos.x) / this.r
  }

  get y () {
    if (!this.touch) return 0.0
    return (this.position.y - this.touch.currentPos.y) / this.r
  }

  set radius (value) {
    this.r = _toPixels(value)
  }

  matchesTouch (touch) {
    const { originPos } = touch
    const { x, y } = this.position

    const dx = (x - originPos.x)
    const dy = (y - originPos.y)
    return Math.sqrt(dx * dx + dy * dy) <= this.r
  }

  draw (c) {
    c.beginPath()
    c.strokeStyle = (this.touch && this.touchedStyle) || this.style
    c.lineWidth = 6
    c.arc(this.position.x, this.position.y, 40, 0, Math.PI * 2, true)
    c.stroke()

    c.beginPath()
    c.strokeStyle = (this.touch && this.touchedStyle) || this.style
    c.lineWidth = 2
    c.arc(this.position.x, this.position.y, this.r, 0, Math.PI * 2, true)
    c.stroke()

    // paint the current touch //
    if (this.touch) {
      const { currentPos } = this.touch
      c.beginPath()
      c.strokeStyle = this.style
      c.arc(currentPos.x, currentPos.y, 40, 0, Math.PI * 2, true)
      c.stroke()
    }
  }
}

export class Button extends Control {
  constructor (name) {
    super(name)
    this.r = _toPixels(10)
    this.sticky = false
    this.style = 'white'
  }

  get pressed () {
    return !!this.touch
  }

  set radius (value) {
    this.r = _toPixels(value)
  }

  matchesTouch (touch) {
    const { originPos } = touch
    const { x, y } = this.position

    const dx = (x - originPos.x)
    const dy = (y - originPos.y)
    return Math.sqrt(dx * dx + dy * dy) <= this.r
  }

  draw (c) {
    c.beginPath()
    c.strokeStyle = this.style
    c.lineWidth = 6
    c.arc(this.position.x, this.position.y, 40, 0, Math.PI * 2, true)
    c.stroke()
  }
}

const _controls = { }

function onTouchStart (e) {
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i]
    for (let j = 0; j < _controls.length; j++) {
      const control = _controls[j]
      if (control.captureTouch(touch)) {
        
      }
    }
  }
}
function onTouchMove (e) {

}
function onTouchEnd (e) {

}

function onMouseStart (e) {

}

function onMouseEnd (e) {

}

function onMouseMove (e) {

}

let _canvas = null
export const TouchManager = {
  setCanvas (canvas) {
    if (_canvas) {
      _canvas.removeEventListener('touchstart', onTouchStart, false)
      _canvas.removeEventListener('touchmove', onTouchMove, false)
      _canvas.removeEventListener('touchend', onTouchEnd, false)

      _canvas.removeEventListener('mousedown', onMouseStart, false)
      _canvas.removeEventListener('mousemove', onMouseMove, false)
      _canvas.removeEventListener('mouseup', onMouseEnd, false)
      TouchManager.clear()
    }
    canvas.addEventListener('touchstart', onTouchStart, false)
    canvas.addEventListener('touchmove', onTouchMove, false)
    canvas.addEventListener('touchend', onTouchEnd, false)

    canvas.addEventListener('mousedown', onMouseStart, false)
    canvas.addEventListener('mousemove', onMouseMove, false)
    canvas.addEventListener('mouseup', onMouseEnd, false)
    _canvas = canvas
  }
}
