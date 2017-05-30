import http from 'http'
import express from 'express'
import bodyParser from 'body-parser'
import WebSocket from 'ws'

const port = process.env.PORT
const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server, path: '/ws' })

app.use(bodyParser.text({ type: 'text/plain' }))
app.use(bodyParser.json({ type: 'application/json' }))

// serve static files from build directory //
app.use(express.static('./build'))

let _lastMessage = null
app.put('/control', (req, res) => {
  if (req.body !== _lastMessage) {
    console.log(req.method, req.url, req.body)
    _lastMessage = req.body
  }
  setTimeout(() => res.send('Hello world'), 50)
})

wss.on('connection', function connection (ws, req) {
  console.log('connect!')
  ws.on('message', function incoming (message) {
    console.log('received: %s', message)
  })

  ws.send('something')
})

// start the listener //
server.listen(port, () => {
  console.log(`Server listening on port: ${port}`)
})
