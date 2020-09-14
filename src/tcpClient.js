const net = require('net');
const url = require('url');
const selfSigned = require('openssl-self-signed-certificate');
const tls = require('tls');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

function handleError(str, callback) {
    return function (e) {
        callback && callback();
        console.error(str, e);
    }
}

const options = {
    key: selfSigned.key,
    cert: selfSigned.cert,
    port: 9999,
    host: '0.0.0.0'
}

let server = net.createServer((cSock) => {
    let count = 1;
    let sSock = null;
    cSock.on('data', (data) => {
        if (count === 1) {
            count = 0;
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
            sSock.on('error', handleError('sSock error', () => {
                sSock.destroy();
            }));
            sSock.on('close', () => {
                sSock.destroy();
            });
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
server.listen(8888, '0.0.0.0');