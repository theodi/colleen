
'use strict';

var soundOptions = {
  pathToRoot: 'public/audio',
  baseUrl : '/audio',
  // baseUrl : 'http://www.vauxlab.com/audio', // NEEDS CORS HEADERS
  extension : 'mp3',
  crossfadeSec : 1.5,

};


module.exports = {
  soundOptions: soundOptions
};
