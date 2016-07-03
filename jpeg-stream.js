module.exports = JpegStream

var TranformStream = require('readable-stream').Transform
  , Jpeg = require('jpeg').Jpeg
  , util = require('util')

function JpegStream() {
  TranformStream.call(this)
}

util.inherits(JpegStream, TranformStream)

JpegStream.prototype._transform = function (chunk, encoding, callback) {
  var jpeg = new Jpeg(chunk, 640, 480, 'rgb')
  jpeg.encode(function (image) {
    callback(null, image)
  })
}
