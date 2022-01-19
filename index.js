// Richard Hawkins 18/01/2022

//////////////////////////////////////////
//////////////// LOGGING /////////////////
//////////////////////////////////////////

function getCurrentDateString() {
    return (new Date()).toISOString() + ' ::';
}
__originalLog = console.log;
console.log = function () {
    var args = [].slice.call(arguments);
    __originalLog.apply(console.log, [getCurrentDateString()].concat(args));
};

//////////////////////////////////////////
//////////////// GLOBAL //////////////////
//////////////////////////////////////////

const fs = require('fs');
const https = require('https')
const express = require('express');
const { V4MAPPED } = require('dns');

//////////////////////////////////////////
///////////////// VARIA //////////////////
//////////////////////////////////////////

function necessary_dirs() {
    if (!fs.existsSync('./data/')) {
        fs.mkdirSync('./data/');
    }
}
necessary_dirs()

//////////////////////////////////////////
//////////////// CONFIG //////////////////
//////////////////////////////////////////

const SETTINGS_FILE = 'settings.json';

let HEROKU_KEY = null;

function loadConfig() {
    if (fs.existsSync(SETTINGS_FILE)) {
        const CFG_DATA = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        HEROKU_KEY = CFG_DATA.heroku_key;
    } else {
        HEROKU_KEY = process.env.HEROKU_KEY;
    }
    if (!HEROKU_KEY)
        throw 'Failed loading, missing API keys!'

}

loadConfig()

//////////////////////////////////////////
//////////////// RESTART /////////////////
//////////////////////////////////////////

function restartApp() {
    console.log('Restart of Speech-to-Text Bot triggered.')
    const options = {
        hostname: 'api.heroku.com',
        path: '/apps/hawkinsr-speech-to-text/dynos',
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.heroku+json; version=3',
            'Authorization': 'Bearer ' + HEROKU_KEY,
        },
    }
    console.log('Request path: ' + options.hostname + options.path)

    const req = https.request(options, (res) => {
        console.log('statusCode: ', res.statusCode);
        console.log('headers: ', res.headers);
        
        res.on('data', (d) =>{
            console.log(d)
        });
    });

        req.on('error', (e) => {
            console.error(e)
        });

        req.end();

    console.log('Restart request sent')
}


const app = express();
app.use(express.static("public"));

app.get('/restart', function (req, res) {
    console.log('Restart request recieved.')
    restartApp();
    
});

var server = app.listen(process.env.PORT || 8081, function() {
    var port = server.address().port;
    console.log("Listening on: " + port)
})
