module.exports = onHttpConnection

var fs = require('fs')

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
  } else {
    res.writeHead(404)
    res.end('Not Found')
  }
}
