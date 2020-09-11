const http = require('http');

let server = new http.Server();
server.on('request', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('boat ing<br>');
    res.end('boat end\n');
});
server.listen('8888');
console.log('start');