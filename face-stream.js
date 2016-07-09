module.exports = FaceStream

var TranformStream = require('readable-stream').Transform
  , util = require('util')
  , fs = require('fs')
  , Canvas = require('canvas')
  , canvas = new Canvas(640, 480)
  , ctx = canvas.getContext('2d')
  , cv = require('opencv')

ctx.strokeStyle = 'red'

function FaceStream(options) {
  TranformStream.call(this)
  this.imageDir = options.imageDir
}

util.inherits(FaceStream, TranformStream)

FaceStream.prototype._transform = function (chunk, encoding, callback) {
  var self = this
    , img = new Canvas.Image()

  img.src = chunk
  ctx.drawImage(img, 0, 0, img.width, img.height)

  cv.readImage(chunk, function (error, im) {
    if (error) return callback(error)
    if (im.width() < 1 || im.height() < 1) return callback(new Error('Image has no size'))

    im.detectObject(cv.FACE_CASCADE, { neighbors: 5 }, function (error, faces) {
      if (error) return callback(error)

      faces.forEach(function (face) {
        ctx.strokeRect(face.x, face.y, face.width, face.height)
      })

      // console.log(new Date(), 'Num faces:', faces.length)

      if (faces.length) {
        self.emit('face')
        var canvasStream = canvas.jpegStream({ quality: 100 })
          , outStream = fs.createWriteStream(self.imageDir + '/' + new Date() + '.jpg')

        canvasStream.on('data', function (canvasChunk) {
          outStream.write(canvasChunk)
        })
      }

      callback(null, chunk)
    })

  })
}
