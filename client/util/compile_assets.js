#!/usr/local/bin/node

var fs = require('fs');
var xml2js = require('xml2js');
var _ = require('lodash');

console.log('compile_assets');

var jsonFiles = [];
var svgFiles = [];
var projectRules = [];

loadProjects();

function loadProjects(){

    //'/../data/20140521_comp_01+bounds.svg';
    var filename = '/../data/projects_test.json';
    var path = '/../data/';

    fs.readFile(__dirname + filename, 'utf8', function (err, data) {
        if (err) {
            console.log('Error: ' + err);
            return;
        }

        var projects = JSON.parse(data);
        _.each(projects,function(project){
            jsonFiles.push(path+project.name+".json");
            svgFiles.push(path+project.name+".svg");

        });

        var nextJson = jsonFiles.shift();
        loadJSON(nextJson);

        console.dir(data);
    });
}



function loadJSON(filename){
    fs.readFile(__dirname + filename, 'utf8', function (err, data) {

        if(err){
            console.log('Error: ' + err);
            if(jsonFiles.length==0) return;
            var nextJson = jsonFiles.shift();
            loadJSON(nextJson);
            return;
        }

        data = JSON.parse(data);
        projectRules.push(data);
        var nextSvg = svgFiles.shift();

        parseSVG(nextSvg,data);

        return data;
    });
}

function parseSVG(filename,projectJson){
    var parser = new xml2js.Parser();
    console.log('svg filename',filename);
    fs.readFile(__dirname + filename, function(err, data) { // comp_01
        if(err){
            console.log('Error: ' + err);
            if(jsonFiles.length==0) return;

            var nextJson = jsonFiles.shift();
            loadJSON(nextJson);
            return;

        }

        parser.parseString(data, function (err, json) {
            console.dir(json);
            /*
            var paths = json.svg.g[0].path;
            console.log(json.svg.g[0].path[0]);
            console.log(json.svg.g[0].path[0]['$'].stroke);
            */
            var paths = json.svg.path;
            var rects = json.svg.rect;
            //console.log(json.svg.path[0]);
            //console.log(json.svg.path[0]['$'].stroke);


            _.each(paths, function(path,index){
                var id = _.find(projectJson.paths,{'id':index.toString()});
                console.log(path['$'].d);
                console.log(path['$'].stroke);
                console.log('id',id);
                var d = path['$'].d;
                d =  d.replace(/\s/g, "");
                id.d = d;
            });
            _.each(rects, function(rect,index){
                var id = _.find(projectJson.paths,{'id':index.toString()});
                console.log('x',rect['$'].x);
                console.log('y',rect['$'].y);
                console.log('w',rect['$'].width);
                console.log('h',rect['$'].height);
                console.log('id',id);
                id.bounds = rect['$'];
            });

        });

        if(jsonFiles.length==0) saveProjectRules();
    });
}


function saveProjectRules(){

    var filename = '/../data/project_rules.json';
    var path = '/../';
    var str = JSON.stringify(projectRules);

    fs.writeFile(__dirname + filename, str, function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log("The file was saved!");
        }
    });
}



