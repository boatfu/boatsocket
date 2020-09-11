const http = require('http');
const net = require('net');
const url = require('url');
// const crypto = require("crypto");
function connect(request, cSock) {
    console.log('hello connect');
    const u = url.parse('http://' + request.url);
    const sSock = net.connect(u.port, u.hostname, () => {
        cSock.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        sSock.pipe(cSock);
    });
    sSock.on('error', (e) => {
        console.error(e);
        cSock.end();
    });
    cSock.pipe(sSock);
}
function request(request, response) {
    response.write('hello response');
    response.end();
}

const client = http.createServer();
client.on('connect', connect);
client.on('request', request);
client.on('error', (e) => {
    console.error(e);
});
client.listen('8888', '0.0.0.0');