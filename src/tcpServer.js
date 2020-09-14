const net = require('net');
const selfSigned = require('openssl-self-signed-certificate');
const tls = require('tls');
function handleError(str, callback) {
    return function(e) {
        callback && callback();
        console.error(str, e);
    }
}

const options = {
    key: selfSigned.key,
    cert: selfSigned.cert
}

function handShake(data) {
    const cSock = this;
    let sSock = null;
    const arr = data.toString().split('&');
    sSock = new net.Socket().connect(arr[0], arr[1], () => {
        sSock.on('data', (data) => {
            cSock.write(data);
        });
    });
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

const server = tls.createServer(options, (cSock) => {
    cSock.once('data', handShake.bind(cSock));
    cSock.on('error', handleError('cSock error', () => {
        cSock.destroy();
    }));
    cSock.on('close', () => {
        cSock.destroy();
    });
});

server.listen(9999, '0.0.0.0');