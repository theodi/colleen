'use strict';

var fs = require('fs');
var config = require('../config/config');
var debug = require('debug')('soundengine');
var async = require('async');
var path = require('path');


exports.test = function(req, res) {
  res.sendfile(path.resolve('client/sound.html'));
};

exports.config = function(req, res) {
  // res.render('sound', { title: 'Sound Engine' });
  compileSoundConfig(config.soundOptions, function(err, result){
    if(err){
      res.status(500).send('An error occurred when compiling sound configuration'+err.message);
      return;
    }
    saveConfig(result);

    res.status(200).json(result);
  });
};

exports.outputConfig = function(){
    compileSoundConfig(config.soundOptions, function(err, result){
        if(err){
            console.log('Error: '+err.message);
            return;
        }
        saveConfig(result);
    });
}


function saveConfig(json){

    var filename = '/../client/data/sound_config.json';
    var str = JSON.stringify(json,null,'\t');

    fs.writeFile(__dirname + filename, str, function(err) {
        if(err) {
            debug(err);
        } else {
            debug("sound_config.json was saved!");
        }
    });

}
//============ PASTE FROM ORIGINAL ========

function listDirectories(dir, extension, cb){
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return cb(err);

    var pending = list.length;
    if (!pending) return cb(null, []);

    console.log('list', list);

    list.forEach(function(folder) {
      var folderpath = path.join(dir, folder);
      fs.stat(folderpath, function(err, stat) {
        if (stat && stat.isDirectory()) {
          results.push(folderpath);
        }else{
          // debug('not a directory', folder);
        }
        if (!--pending) cb(null, results);
      });
    });
  });
}

function listFilenames(dir, fileExt, cb){
  var results = [];
  fileExt = '.'+fileExt; // for path.extname returns .ext
  fs.readdir(dir, function(err, list) {
    if (err){
      // if the directory doesn't exist it might be ok
      // they are optional
      // debug('Cannot find', dir, '...skipping'); // not really an error
      return cb(null, []);
    }

    // sort filelist to make it alphabetical order
    list.sort(function(a, b) {
        return a < b ? -1 : 1;
    });

    var pending = list.length; // counting
    if (!pending) return cb(null, []);

    list.forEach(function(filename) {
      var filepath = dir + '/' + filename;
      fs.stat(filepath, function(err, stat) {
        if (stat && stat.isFile()) {
          var isHidden = /^\./.test(filename);
          var ext = path.extname(filename);
          if(!isHidden && ext === fileExt)
            results.push(filename);
        }
        // one down
        if (!--pending) cb(null, results);
      });
    });
  });
}

function compileSoundConfig(options, callback){
  var root = path.join(__dirname, '../', options.pathToSoundset);
  var fileExt = options.extension || 'mp3';
  var config = {
    options : options,
    scenes : []
  };

  debug('Compiling sound config for', fileExt, 'files in', root);

  async.waterfall([
    function(callback){
      listDirectories(root, fileExt, callback);
    },
    function(projects, callback){
      if(!projects.length){
        return callback(new Error('Empty audio directory '+ root));
      }

      async.each(projects, function(dir, cb){
        var folders = dir.split('/');
        var projectId = folders[folders.length - 1];

        debug('Parsing folder contents for', projectId);
        // var dir = root + '/' + project;
        async.series({
          volumes: function(callback){
            // read json file from scene directory
            try{
              // var json = require(dir + '/volumes.json');
              var json = JSON.parse(fs.readFileSync(dir + '/volumes.json', 'utf8'));
              // debug('json', json);
              callback(null, json);
            }catch(err){
              debug('no volumes.json file found for', projectId);
              callback(null, {});
            }
          },
          layers: function(callback){
            listFilenames(dir + '/layers', fileExt, callback);
          },
          smplr_a: function(callback){
            listFilenames(dir + '/smplr_a', fileExt, callback);
          },
          smplr_b: function(callback){
            listFilenames(dir + '/smplr_b', fileExt, callback);
          }
        }, function(err, results){
          if(err) return cb(err);

          // debug('volumes', results.volumes);
          // debug('layers', results.layers);
          // debug('smplr', results.smplr);
          // debug('smplr_a', results.smplr_a);
          // debug('smplr_b', results.smplr_b);


          config.scenes.push({
            id : projectId,
            volumes : results.volumes,
            layers : results.layers,
            smplr_a : results.smplr_a,
            smplr_b : results.smplr_b
          });
          cb(null);
        });// async series
      }, callback); // async each
    }
  ], function(err){
    if(err) return callback(err);
    debug('Sound config compilation finished');
    return callback(null, config);
  }); // async waterfall
}
