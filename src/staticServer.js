const express = require('express');
const path = require('path');
const appStatic = express();
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const staticPort = 443;
const httpPort = 80;
const http = express();

const staticPath = path.resolve(__dirname, '../public');
const keyPath = path.resolve(__dirname, '../sec/moleszczukorg/moleszczuk.org.key');
const certPath = path.resolve(__dirname, '../sec/moleszczukorg/moleszczuk.org.crt');
const pathToNetCert = path.resolve(__dirname, '../sec/moleszczuknet/moleszczuk.net.crt');

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
    cert: fs.readFileSync(pathToNetCert)
}) ;

const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
}
http.use('*', function(req, res) {  
    res.redirect('https://' + req.headers.host + req.url);

    // Or, if you don't want to automatically detect the domain name from the request header, you can hard code it:
    // res.redirect('https://example.com' + req.url);
})

appStatic.use(express.json());
appStatic.use(express.urlencoded({ extended: true }));
appStatic.use(express.static(staticPath))

appStatic.get('/rest', (req, res) => {
    axios.get('https://moleszczuk.net:3000/db', { httpsAgent }).then(response => res.json(response.data));
});

appStatic.post('/rest', function (req, res, next) {
    axios.post('https://moleszczuk.net:3000/db', {value: req.body.value},  { httpsAgent }).then(response => {
        res.json(response.data)
    });
});

function runStaticServer() {
    http.listen(httpPort);
    https.createServer(httpsOptions, appStatic)
    .listen(staticPort, () => {
        console.log('server running at ' + staticPort)
    })
}

module.exports = {
    runStaticServer: runStaticServer,
}