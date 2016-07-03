module.exports = MotionStream

var TranformStream = require('readable-stream').Transform
  , Motion = require('motion-detect').Motion
  , util = require('util')

function MotionStream(options) {
  TranformStream.call(this)
  this.motion = new Motion(options)
  this.lastRunTime = null
}

util.inherits(MotionStream, TranformStream)

MotionStream.prototype._transform = function (chunk, encoding, callback) {
  var now = (new Date()).getTime()
  if (!this.lastRunTime || now - this.lastRunTime > 1000) {
    this.lastRunTime = now
    var hasMotion = this.motion.detect(chunk.toByteArray())
    if (hasMotion) this.emit('motion')
  }
  callback(null, chunk)
}

Buffer.prototype.toByteArray = function () {
  return Array.prototype.slice.call(this, 0)
}
