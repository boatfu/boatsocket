const https = require('https');
const http = require('http');
const net = require('net');
const crypto = require("crypto");
const fs = require('fs');
const selfSigned = require('openssl-self-signed-certificate');

function handleError(e) {
    console.error(e);
}
const options = {
    key: selfSigned.key,
    cert: selfSigned.cert
}
const httpsServer = https.createServer(options).listen(9999, '0.0.0.0');
const WebsocketServer = require('ws').Server;
const wss = new WebsocketServer({
    server: httpsServer
});
wss.on('connection', (ws) => {
    let count = 1;
    let sSock = null;
    ws.on('message', (message) => {
        if (count === 1) {
            let arr = message.split('-');
            count = 0;
            if (arr[2] !== 'password') {
                ws.close();
            }
            sSock = net.Socket().connect(arr[0], arr[1]);
            sSock.on('data', (data) => {
                ws.send(data);
            });
            sSock.on('error', handleError);
        } else {
            sSock.write(message);
        }
    });
    ws.on('error', handleError);
});
wss.on('error', handleError);