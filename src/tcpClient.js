const net = require('net');
const url = require('url');
const selfSigned = require('openssl-self-signed-certificate');
const tls = require('tls');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const options = {
    key: selfSigned.key,
    cert: selfSigned.cert,
    port: 9999,
    host: '0.0.0.0'
}

function handleError(str, callback) {
    return function (e) {
        callback && callback();
        console.error(str, e);
    }
}

function handShake(data) {
    const cSock = this;
    let sSock = null;
    const HOSTReg = /Host: (.*?)\r\n/;
    const CONNECTReg = /^CONNECT (.*?) HTTP/;
    const u = url.parse('http://' + data.toString().match(HOSTReg)[1]);
    if (CONNECTReg.test(data.toString())) {
        sSock = tls.connect(options, () => {
            cSock.write('HTTP/1.1 200 Connection Established\r\n\r\n');
            sSock.write((u.port || 80) + '&' + u.hostname);
            sSock.on('data', (data) => {
                cSock.write(data);
            });
        });
    } else {
        sSock = tls.connect(options, () => {
            sSock.write((u.port || 80) + '&' + u.hostname);
            sSock.write(data);
            sSock.on('data', (data) => {
                cSock.write(data);
            });
        });
    }
    cSock.on('data', handleProxy.bind(sSock));
    sSock.on('error', handleError('sSock error', () => {
        sSock.destroy();
    }));
    sSock.on('close', () => {
        sSock.destroy();
    });
}

function handleProxy(data) {
    const sSock = this;
    sSock.write(data);
}

const server = net.createServer((cSock) => {
    cSock.once('data', handShake.bind(cSock));
    cSock.on('error', handleError('cSock error', () => {
        cSock.destroy();
    }));
    cSock.on('close', () => {
        cSock.destroy();
    });
});

server.listen(8888, '0.0.0.0');