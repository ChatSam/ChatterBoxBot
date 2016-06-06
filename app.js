var Bot = require('node-telegram-bot-api');
var watson = require('watson-developer-cloud');
var request = require('request');

var speechToText = watson.speech_to_text({
    username:'53b8197a-816e-439a-bf5f-aca17b2e2498',
    password:'KzJmdrFOsByf',
    version: 'v1',
    url: 'https://stream.watsonplatform.net/speech-to-text/api'
});

var params = {
  model: 'en-US_BroadbandModel', //place to change language
  content_type: 'audio/ogg;codecs=opus',
  continous: true,
  interim_results:false
};

var bot = new Bot ('221642184:AAFREA81EalrSWZhXy1eCii0fJn0VEhoQLw',{ polling :true });

bot.on('message', function (msg){
    if(msg['voice']){ 
        return onVoiceMessage(msg);
    }
});

function onVoiceMessage(msg){
    var chatId = msg.chat.id;
    bot.getFileLink(msg.voice.file_id).then(function(link){
        
        //setup new recognizer stream
        var recognizeStream = speechToText.createRecognizeStream(params);
        recognizeStream.setEncoding('utf8');
        
        recognizeStream.on('results', function(data) {
            if (data && data.results && data.results.length > 0 && data.results[0].alternatives 
               && data.results[0].alternatives.length > 0){
                var result = data.results[0].alternatives[0].transcript;
                console.log("result: ",result);
            
            
        //send speech recognizer result back to chat 
        bot.sendMessage(chatId, result, {
            disable_notification: true,
            reply_to_message_id: msg.message_id
        }).then(function(){
            //reply sent!
        });
        }
            
        });
        
        ['data','error','connection-close'].forEach(function(eventName){
            recognizeStream.on(eventName, console.log.bind(console, eventName + ' event: '))
        });
        
        //pipe voice message to recognizer -> send to watson
        request(link).pipe(recognizeStream);
    });
}

/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
