const net = require('net');
const url = require('url');
const Websocket = require('ws');
const fs = require('fs');
const path = require('path');
const { config } = require('process');

function handleError(str, callback) {
    return function (e) {
        callback && callback();
        console.error(str, e);
    }
}

function handShake(config, data) {
    const cSock = this;
    const HOSTReg = /Host: (.*?)\r\n/;
    const CONNECTReg = /^CONNECT (.*?) HTTP/;
    let u;
    try {
        u = url.parse('http://' + data.toString().match(HOSTReg)[1]);
    } catch(e) {
        console.error(e);
        cSock.destroy();
        return;
    }
    const ws = new Websocket('wss://' + config.serverIP + ':' + config.serverPort);

    if (CONNECTReg.test(data.toString())) {
        ws.on('open', () => {
            cSock.write('HTTP/1.1 200 Connection Established\r\n\r\n');
            ws.send((u.port || 80) + '&' + u.hostname + '&' + config.password);
            ws.on('message', (data) => {
                cSock.write(data);
            });
        });
    } else {
        ws.on('open', () => {
            ws.send((u.port || 80) + '&' + u.hostname + '&' + config.password);
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



function main() {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
    let config;
    try {
        config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../config/config.json')).toString());;
    } catch(e) {
        console.error(e);
        return;
    }
    let {clientPort} = config;

    const server = net.createServer((cSock) => {
        cSock.once('data', handShake.bind(cSock, config));
        cSock.on('error', handleError('cSock error', () => {
            cSock.destroy();
        }));
    });
    
    server.listen(clientPort, '0.0.0.0');
}

main();