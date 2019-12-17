const express = require('express');
// const cors = require('cors');
const app = express();
const path = require('path');
const port = 3000;
const https = require('https')
const fs = require('fs')
const db = require('./db').db;
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const passportJWT = require('passport-jwt');
const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
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

const usersArray = [
    {
        id: 1,
        username: 'Marcin',
        password: '1234'
    },
    {
        id: 2,
        username: 'Michał',
        password: '1984',
    },
    {
        id: '3',
        username: 'Krzysiek',
        password: '3535'
    }
];

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

passport.use( new BasicStrategy(
    function(username, password, done) {
        const user = usersArray.find( user => user.username === username && user.password === password)
        if ( !user ) {return done(null, false); }
        return done(null, user);
    }
))

passport.use(new JwtStrategy (
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: 'nieprawdopodobnySekret'
    },
    (jwtPayload, done) => {
        const user = usersArray.find( user => user.id === jwtPayload.id);
        if (!user) { return done(null, false); }
        return done(null, user)
    }
));

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

app.get('/basic/db',passport.authenticate('basic', {session: false}), (req, res) => {
    res.json(db)
});

app.post('/basic/db', passport.authenticate('basic', {session: false}), function (req, res, next) {
    db.value = req.body.value;
    res.json(db);
});

app.get('/jwt/db',passport.authenticate('jwt', {session: false}), (req, res) => {
    res.json(db)
});

app.post('/jwt/db', passport.authenticate('jwt', {session: false}), function (req, res, next) {
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