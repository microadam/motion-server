var createConnectionHandler = require('./connection-handler')
  , unpipe = require('unpipe')
  , MotionDetect = require('./motion-stream')
  , motionDetectStream = new MotionDetect({ minChange: 6, threshold: 0x10 })
  , kinect = require('./kinect-stream')()
  , videoStream = new kinect.VideoStream()
  , depthStream = new kinect.DepthStream()
  , BufferStream = require('bufferstream')
  , bufferedStream = new BufferStream()
  , http = require('http')
  , Primus = require('primus')
  , Emitter = require('primus-emitter')

depthStream.pipe(motionDetectStream)
videoStream.pipe(bufferedStream)

var onHttpConnection = createConnectionHandler(bufferedStream)
  , httpServer = http.createServer(onHttpConnection)
  , videoServer = new Primus(httpServer
    , { transformer: 'websockets'
      , parser: 'binary'
      , pathname: '/video'
      , global: 'VideoServer'
      }
    )
  , controlServer = new Primus(httpServer
    , { transformer: 'websockets'
      , parser: 'JSON'
      , pathname: '/control'
      , global: 'ControlServer'
      }
    )
  , currentVideoMode = 'RGB'

controlServer.use('emitter', Emitter)

kinect.control.led('off')

motionDetectStream.on('data', function () {})
motionDetectStream.on('motion', function () {
  kinect.control.led('yellow')
  setTimeout(function () {
    kinect.control.led('off')
  }, 500)
  controlServer.send('motion')
})

controlServer.on('connection', function (spark) {
  spark.send('videoModeChange', { mode: currentVideoMode })

  spark.on('changeVideoMode', function (data) {
    currentVideoMode = data.mode
    kinect.control.setVideoMode(data.mode)
    spark.send('videoModeChange', data)
  })

  spark.on('changeTilt', function (data) {
    kinect.control.tilt(data.tilt)
  })

})

videoServer.on('connection', function (spark) {
  bufferedStream.pipe(spark)
  spark.on('end', function () {
    unpipe(spark)
  })
})

httpServer.listen(4048, '0.0.0.0')
