const net = require('net');
const url = require('url');
const Websocket = require('ws');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

function handleError(str, callback) {
    return function (e) {
        callback && callback();
        console.error(str, e);
    }
}

function handShake(data) {
    const cSock = this;
    const HOSTReg = /Host: (.*?)\r\n/;
    const CONNECTReg = /^CONNECT (.*?) HTTP/;
    const u = url.parse('http://' + data.toString().match(HOSTReg)[1]);
    const ws = new Websocket('wss://0.0.0.0:9999');

    if (CONNECTReg.test(data.toString())) {
        ws.on('open', () => {
            cSock.write('HTTP/1.1 200 Connection Established\r\n\r\n');
            ws.send((u.port || 80) + '&' + u.hostname + '&' + 'password');
            ws.on('message', (data) => {
                cSock.write(data);
            });
        });
    } else {
        ws.on('open', () => {
            ws.send((u.port || 80) + '&' + u.hostname + '&' + 'password');
            ws.send(data);
            ws.on('message', (data) => {
                cSock.write(data);
            });
        });
    }
    cSock.on('data', handleProxy.bind(ws));
    ws.on('error', handleError('ws error', () => {
        ws.close();
    }));
}

function handleProxy(data) {
    const ws = this;
    ws.send(data);
}

const server = net.createServer((cSock) => {
    cSock.once('data', handShake.bind(cSock));
    cSock.on('error', handleError('cSock error', () => {
        cSock.destroy();
    }));
});

server.listen(8888, '0.0.0.0');