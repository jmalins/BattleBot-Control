
function TouchCanvas (canvas) {
  this.canvas = canvas
  const self = this

  this.interval = setInterval(this.draw, 1000 / 35)

  this.resize = function (width, height) {
    self.canvas.width = width
    self.canvas.height = height
  }

  this.draw = function () {
    this.canvas.clearRect(0, 0, canvas.width, canvas.height)

  }
}
