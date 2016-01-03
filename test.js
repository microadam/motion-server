var Primus = require('primus')
  , Emitter = require('primus-emitter')
  , Socket = Primus.createSocket(
      { transformer: 'websockets'
      , parser: 'JSON'
      , plugin: { emitter: Emitter }
      , pathname: '/control'
      })
  , client = new Socket('http://127.0.0.1:4048')

client.on('motion', function () {
  console.log('motion')
})
