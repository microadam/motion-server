module.exports = createConnectionHandler

var fs = require('fs')
  , Jpegs2mjpeg = require('jpegs2mjpeg')
  , JpegStream = require('./jpeg-stream')

function createConnectionHandler(videoStream) {

  var mjpeg = new Jpegs2mjpeg()

  mjpeg.on('ready', function () {
    var jpegStream = new JpegStream()
    videoStream.pipe(jpegStream)
    mjpeg.send(jpegStream)
  })

  function returnFile(file, res) {
    fs.readFile(__dirname + '/www/' + file, function (error, data) {
      if (error) {
        res.writeHead(500)
        return res.end('Error loading file')
      }
      res.writeHead(200)
      res.end(data)
    })
  }

  function onHttpConnection(req, res) {
    if (req.url === '/') {
      returnFile('index.html', res)
    } else if (req.url === '/client.js') {
      returnFile('client.js', res)
    } else if (req.url === '/stream/video') {
      mjpeg.addClient(req, res)
    } else {
      res.writeHead(404)
      res.end('Not Found')
    }
  }

  return onHttpConnection
}
