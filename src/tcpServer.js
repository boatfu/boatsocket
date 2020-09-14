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

const server = tls.createServer(options, (cSock) => {
    let count = 1 ;
    let sSock = null;
    cSock.on('data', (data) => {
        if (count === 1) {
            count = 0;
            const arr = data.toString().split('&');
            sSock = new net.Socket().connect(arr[0], arr[1], () => {
                sSock.on('data', (data) => {
                    cSock.write(data);
                });
            });
            sSock.on('error', handleError('sSock error', () => {
                sSock.destroy();
            }));
            sSock.on('close', () => {
                sSock.destroy();
            })
        } else {
            sSock.write(data);
        }
    });
    cSock.on('error', handleError('cSock error', () => {
        cSock.destroy();
    }))
    cSock.on('close', () => {
        cSock.destroy();
    });
});
server.listen(9999, '0.0.0.0');