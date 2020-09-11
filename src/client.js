const http = require('http');
const url = require('url');
const crypto = require('crypto');
const Websocket = require('ws');
function handleError(e) {
    console.error(e);
}
function connect(request, cSock) {
    console.log('hello connect');
    const u = url.parse('http://' + request.url);
    const ws = new Websocket('ws://localhost:9999');
    ws.on('open', () => {
        console.log('open!')
        cSock.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        ws.send(u.port + '-' + u.hostname);
    });
    ws.on('message', (message) => {
        console.log('will send back data', message);
        cSock.write(message);
    });
    ws.on('error', handleError);
    cSock.on('data', (data) => {
        console.log('will send data', data);
        ws.send(data);
    });
    cSock.on('error', handleError);
}
const client = http.createServer();
client.on('connect', connect);
client.on('error', handleError);
client.listen('8888', '0.0.0.0');