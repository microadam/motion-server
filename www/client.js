var videoServer = window.VideoServer.connect()
  , controlServer = window.ControlServer.connect()
  , width = 640
  , height = 480
  , ctx = document.getElementById('canvas').getContext('2d')
  , currentVideoMode = null

$('.js-change-mode').on('click', function () {
  var data = { mode: currentVideoMode === 'IR' ? 'RGB' : 'IR' }
  controlServer.send('changeVideoMode', data)
})

controlServer.on('videoModeChange', function (data) {
  currentVideoMode = data.mode
})

videoServer.on('data', function (data) {
  var bytearray = new Uint8Array(data)
    , imgdata = ctx.getImageData(0,0, width, height)

  for (var i = 0; i < imgdata.data.length / 4; i++) {

    if (currentVideoMode === 'IR') {
      var ir = (bytearray[i] + bytearray[i + 1] + bytearray[i + 2]) / 3 * bytearray[i + 3] / 255
      imgdata.data[4 * i] = ir
      imgdata.data[4 * i + 1] = ir
      imgdata.data[4 * i + 2] = ir
      imgdata.data[4 * i + 3] = 255 - bytearray[i + 3]
    } else if (currentVideoMode === 'RGB') {
      imgdata.data[4 * i] = bytearray[3 * i]
      imgdata.data[4 * i + 1] = bytearray[3 * i + 1]
      imgdata.data[4 * i + 2] = bytearray[3 * i + 2]
      imgdata.data[4 * i + 3] = 255
    }

    //for depth feed  . bytearray  [val , mult, val2, mult2, ...]
    // var depth = (bytearray[2*i]+bytearray[2*i+1]*255)/5;
    // imgdata.data[4*i] = depth;
    // imgdata.data[4*i+1] = depth;
    // imgdata.data[4*i+2] = depth;
    // imgdata.data[4*i+3] = 255;
  }

  ctx.putImageData(imgdata,0,0)
})
