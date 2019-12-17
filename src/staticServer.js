const express = require('express');
const fs = require('fs');
const https = require('https');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const appStatic = express();
const http = express();
const httpPort = 80;
const staticPort = 443;

const path = require('path');

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

// appStatic.get('/rest', (req, res) => {
//     axios.get('https://moleszczuk.net:3000/db', { httpsAgent }).then(response => res.json(response.data));
// });

// appStatic.post('/rest', function (req, res, next) {
//     axios.post('https://moleszczuk.net:3000/db', {value: req.body.value},  { httpsAgent }).then(response => {
//         res.json(response.data)
//     });
// });

const token = jwt.sign({id: 2}, 'nieprawdopodobnySekret', {expiresIn: 120000});
console.log('Token: ' + token);

appStatic.get('/rest', (req, res) => {
    axios.get('https://moleszczuk.net:3000/jwt/db', {
        httpsAgent,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(response => res.json(response.data)).catch((error) => {
        res.status(error.response.status);
        res.send(error.message);
    })
});

appStatic.post('/rest', (req, res) => {
    axios.post('https://moleszczuk.net:3000/jwt/db', {value: req.body.value},{
        httpsAgent,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(response => res.json(response.data)).catch((error) => {
        res.status(error.response.status);
        res.send(error.message);
    })
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