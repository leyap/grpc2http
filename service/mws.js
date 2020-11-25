const http = require('http');
const WebSocket = require('ws');
const url = require('url');

const server = http.createServer();
const viewerWs = new WebSocket.Server({ noServer: true });

let msgCB = ()=>{}

viewerWs.on('connection', ws => {
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });
  ws.on('message', data => {
    if (data !== 'h') {
      try {
        const json = JSON.parse(data)
        msgCB(json)
      } catch (e) {
        console.log(e.toString())
      }
    }
  });
});

setInterval(() => {
  viewerWs.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

server.on('upgrade', (req, socket, head) => {
  let clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const pathname = url.parse(req.url).pathname;

  if (pathname === '/view') {
    viewerWs.handleUpgrade(req, socket, head, ws => {
      viewerWs.emit('connection', ws, req);
    });
  } else {
    socket.destroy();
  }
});

server.listen(18110);
server.on('error', (error) => {
  console.log(error);
});
server.on('listening', () => {
  var port = server.address().port;
  console.log('\nlistening websocket on ws://localhost:' + port + '/view for web debugger');
});

class Mws {
  constructor () {
  }

}

function onmessage (fn) {
  msgCB = fn
}

module.exports = { clientWS:viewerWs, onmessage };

