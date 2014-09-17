
'use strict';

var soundOptions = {
  pathToSoundset: 'client/audio/exampleset',
  baseUrl : 'audio/exampleset',
  // baseUrl : 'http://www.vauxlab.com/audio', // NEEDS CORS HEADERS
  extension : 'mp3',
  sceneLayersMixMode: 1, // 0 = keep one, 1 = all off
  crossfadeSec : 1.5,
  mixBusVolume : 0
};


module.exports = {
  soundOptions: soundOptions
};
