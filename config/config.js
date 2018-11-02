
'use strict';

var soundOptions = {

  //baseUrl : 'https://s3.amazonaws.com/weneedus/audio/wnu', [old]
  //baseURL : 'https://s3.amazonaws.com/wnu/audio/wnu/',
  //baseUrl : 'https://s3.amazonaws.com/weneedus/audio/wnu2',
  //baseURL : 'https://s3.eu-west-2.amazonaws.com/wnu2/audio/wnu' [sw says works]
  
  baseUrl : 'audio/wnu',
  
  pathToSoundset: 'client/audio/wnu',

  extension : 'mp3',
  sceneLayersMixMode: 1, // 0 = keep one, 1 = all off
  crossfadeSec : 2.5,
  mixBusVolume : 0
};


module.exports = {
  soundOptions: soundOptions
};
