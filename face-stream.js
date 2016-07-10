module.exports = FaceStream

var TranformStream = require('readable-stream').Transform
  , util = require('util')
  , cv = require('opencv')

function FaceStream(options) {
  TranformStream.call(this)
  this.imageDir = options.imageDir
}

util.inherits(FaceStream, TranformStream)

FaceStream.prototype._transform = function (chunk, encoding, callback) {
  var self = this

  cv.readImage(chunk, function (error, im) {
    if (error) return callback(error)
    if (im.width() < 1 || im.height() < 1) return callback(new Error('Image has no size'))

    var cascade = './node_modules/opencv/data/haarcascade_frontalface_alt2.xml'
    im.detectObject(cascade, { neighbors: 8 }, function (error, faces) {
      if (error) return callback(error)
      if (faces.length) {
        self.emit('face')
        faces.forEach(function (face) {
          im.rectangle([face.x, face.y], [face.width, face.height], [0, 255, 0], 2)
        })
        im.save(self.imageDir + '/' + new Date() + '.jpg')
      }
      callback(null, chunk)
    })

  })
}
