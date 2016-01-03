module.exports = kinectStreams

var ReadableStream = require('readable-stream')
  , kinect = require('kinect')
  , util = require('util')

function kinectStreams() {
  var context = kinect({ mode: 'RGB' })
    , streams =
      { VideoStream: VideoStream
      , DepthStream: DepthStream
      , control: context
      }

  function VideoStream() {
    ReadableStream.call(this)
    this.context = context
    this.start()
  }

  util.inherits(VideoStream, ReadableStream)

  VideoStream.prototype.start = function () {
    var lastRunTime = null
    this.context.on('video', function (buf) {
      var now = (new Date()).getTime()
      if (!lastRunTime || now - lastRunTime > (1000 / 5)) {
        lastRunTime = now
        this.push(buf)
      }
      // var isBeingRead = this.push(buf)
      // if (!isBeingRead) {
      //   this.context.pause()
      // }
    }.bind(this))
  }

  VideoStream.prototype._read = function() {
    this.context.resume()
    return true
  }

  function DepthStream() {
    ReadableStream.call(this)
    this.context = context
    this.start()
  }

  util.inherits(DepthStream, ReadableStream)

  DepthStream.prototype.start = function () {
    this.context.on('depth', function (buf) {
      this.push(buf)
      // var isBeingRead = this.push(buf)
      // if (!isBeingRead) {
      //   this.context.pause()
      // }
    }.bind(this))
  }

  DepthStream.prototype._read = function() {
    this.context.resume()
    return true
  }

  context.start('video')
  context.start('depth')

  return streams
}
