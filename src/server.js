const http = require('http');
const net = require('net');
const url = require('url');
const crypto = require("crypto");

function handleError(e) {
    console.error(e);
}
const WebsocketServer = require('ws').Server;
const wss = new WebsocketServer({
    port: 9999
});
wss.on('connection', (ws) => {
    let count = 1;
    let sSock = null;
    ws.on('message', (message) => {
        if (count === 1) {
            count = 0;
            let arr = message.split('-');
            sSock = net.Socket().connect(arr[0], arr[1], () => {
                console.log('connected');
            });
            sSock.on('data', (data) => {
                console.log('receive data', data);
                ws.send(data);
            });
            sSock.on('error', handleError);
        } else {
            console.log('send message', message);
            sSock.write(message);
        }
    });
    ws.on('error', handleError);
});
wss.on('error', handleError);