const net = require('net');
const selfSigned = require('openssl-self-signed-certificate');
const Websocket = require('ws');
const https = require('https');

const options = {
    key: selfSigned.key,
    cert: selfSigned.cert
}

function handleError(str, callback) {
    return function(e) {
        callback && callback();
        console.error(str, e);
    }
}

function handShake(data) {
    const ws = this;
    const arr = data.toString().split('&');
    if (arr[2] !== 'password') {
        ws.close();
        return;
    }
    const sSock = new net.Socket().connect(arr[0], arr[1], () => {
        sSock.on('data', (data) => {
            ws.send(data);
        });
    });
    ws.on('message', handleProxy.bind(sSock));
    sSock.on('error', handleError('sSock error', () => {
        sSock.destroy();
    }));
}

function handleProxy(data) {
    const sSock = this;
    sSock.write(data);
}

const httpsServer = https.createServer(options).listen(9999, '0.0.0.0');

const wss = new Websocket.Server({
    server: httpsServer
});

wss.on('connection', (ws) => {
    ws.once('message', handShake.bind(ws));
    ws.on('error', handleError('ws error', () => {
        ws.close();
    }));
});