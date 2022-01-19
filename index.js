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

const { Console } = require('console');
const { resolveSoa } = require('dns');
//////////////////////////////////////////
//////////////// GLOBAL //////////////////
//////////////////////////////////////////

const fs = require('fs');
const https = require('https')

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

restartApp()




// // Google Speech API
// // https://cloud.google.com/docs/authentication/production
// const gspeech = require('@google-cloud/speech');
// const gspeechclient = new gspeech.SpeechClient({
//     projectId: 'discordbot',
//     keyFilename: 'gspeech_key.json'
// });

// async function transcribe_gspeech(buffer) {
//     try {
//         console.log('transcribe_gspeech')
//         const bytes = buffer.toString('base64');
//         const audio = {
//             content: bytes,
//         };
//         const config = {
//             encoding: 'LINEAR16',
//             sampleRateHertz: 48000,
//             languageCode: 'en-US',  // https://cloud.google.com/speech-to-text/docs/languages
//         };
//         const request = {
//             audio: audio,
//             config: config,
//         };

//         const [response] = await gspeechclient.recognize(request);
//         const transcription = response.results
//             .map(result => result.alternatives[0].transcript)
//             .join('\n');
//         console.log(`gspeech: ${transcription}`);
//         return transcription;

//     } catch (e) { console.log('transcribe_gspeech 368:' + e) }
// }