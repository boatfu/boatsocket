const http = require('http');
const url = require('url');
const crypto = require('crypto');
const Websocket = require('ws');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
function handleError(e) {
    console.error(e);
}
function connect(request, cSock) {
    const u = url.parse('http://' + request.url);
    const ws = new Websocket('wss://localhost:9999');
    ws.on('open', () => {
        cSock.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        ws.send(u.port + '-' + u.hostname + '-' + 'password');
    });
    ws.on('message', (message) => {
        cSock.write(message);
    });
    ws.on('error', handleError);
    cSock.on('data', (data) => {
        ws.send(data);
    });
    cSock.on('error', handleError);
}
const client = http.createServer();
client.on('connect', connect);
client.on('error', handleError);
client.listen('8888', '0.0.0.0');