const express = require('express');
// const cors = require('cors');
const app = express();
const path = require('path');
const port = 3000;
const https = require('https')
const fs = require('fs')
const db = require('./db').db;
const allowedOrigins = [
    'https://localhost',
    'https://moleszczuk.org',
    'https://moleszczuk.net:3000'
];

const keyPath = path.resolve(__dirname, '../sec/moleszczuknet/moleszczuk.net.key');
const certPath = path.resolve(__dirname, '../sec/moleszczuknet/moleszczuk.net.crt');

const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
}

// app.use(cors({
//     origin: function(origin, callback){
//       // allow requests with no origin 
//       // (like mobile apps or curl requests)
//       if(!origin) return callback(null, true);
//       if(allowedOrigins.indexOf(origin) === -1){
//         var msg = 'The CORS policy for this site does not ' +
//                   'allow access from the specified Origin.';
//         return callback(new Error(msg), false);
//       }
//       return callback(null, true);
//     }
//   }));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", allowedOrigins); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    const origin = req.headers.origin;
  if(allowedOrigins.indexOf(origin) > -1){
       res.setHeader('Access-Control-Allow-Origin', origin);
  }
    next();
  });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/db', (req, res) => {
    res.json(db)
});

app.post('/db', function (req, res, next) {
    db.value = req.body.value;
    res.json(db);
});

function runRestServer() {
    https.createServer(httpsOptions, app)
    .listen(port, () => {
        console.log('REST running at ' + port)
    })
}

module.exports = {
    runRestServer: runRestServer,
}