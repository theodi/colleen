
// https://github.com/mikeal/request
var request = require('request');
var _ = require('lodash');
var mysql      = require('mysql');
var fs = require('fs');
//var parseDbUrl = require('parse-database-url');

var WNU_DB_URL = process.env.WNU_DB_URL;
//var dbConfig = parseDbUrl(WNU_DB_URL);

// parse dbname out of connection string
//var WNU_DB_NAME = dbConfig['database'];


var MIN_SECS = 60,
    MIN_5_SECS = 300,
    MIN_15_SECS = 900,
    HOUR_SECS = 3600,
    DAY_SECS = 86400,
    WEEK_SECS = 604800,
    MONTH_SECS = 2592000; // month 30 days

var seriesLength={};
seriesLength[MIN_SECS] = 60, seriesLength[MIN_5_SECS] = 60, seriesLength[MIN_15_SECS] = 60, seriesLength[HOUR_SECS] = 24, seriesLength[DAY_SECS] = 30;

var connection;
var projectList = [], projectQueue = [], seriesQueue = [];

console.log('WNU_DB_URL',WNU_DB_URL);
function connect(){
    connection = mysql.createConnection(WNU_DB_URL+'?timezone=+0000'); // Recreate the connection, since the old one cannot be reused.
}

function disconnect() {
    console.log('Worker: Checking for open DB connections');
    if (null != connection){
        console.log('Worker: Closing DB connection');
        connection.end();
        connection = null;
    }
}

// Handle exit

process.on('exit', function () {
    console.log('Worker: Exiting...');
    disconnect();
    console.log('Worker: Exited.');
});

// happens when you press Ctrl+C
process.on('SIGINT', function () {
    console.log( '\nWorker: Gracefully shutting down worker from  SIGINT (Crtl-C)' );
    process.exit();
});

// usually called with kill
process.on('SIGTERM', function () {
    console.log('Worker: Parent SIGTERM detected (kill)');
    // exit cleanly
    process.exit(0);
});



// Cron

var CronJob = require('cron').CronJob;
new CronJob('*/2 * * * * *', function(){
    var date = new Date();
    console.log("date:", date, date.valueOf());

}, null, false);//, "UTC");



 setInterval(function(){
    console.log("date:", new Date())
 },1000*60);


/*
function testQuery(){
    connect();
    connection.connect(function(err) {              // The server is either down
        if(err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
        }
        else{
            connection.query("SELECT UNIX_TIMESTAMP(created_at) AS time FROM classifications ORDER BY time DESC LIMIT 1",function(err, rows) {

                if(err) throw err;
                maxTimeUnix = rows[0].time;
                console.log("maxTimeUnix",maxTimeUnix);
                disconnect();
            });
        }
    });
}
*/



function loadProjects(){

    var filename = '/../data/projects.json';

    fs.readFile(__dirname + filename, 'utf8', function (err, data) {
        if (err) {
            console.log('Error, loadProjects: ' + err);
            return;
        }

        projectList = JSON.parse(data);

        console.log(projectList);
        //loadJSON(nextJson);
        updateTimeSeries();


    });
}

function startFetch(){
    projectQueue = _.clone(projectList);
    //['galaxy_zoo','milky_way'];//['cyclone_center', 'galaxy_zoo', 'mergers', 'milky_way', 'moon_zoo', 'planet_hunters', 'sea_floor_explorer', 'solar_storm_watch', 'whalefm'];

    connect();
    connection.connect(function(err) {
        if(err) {
            console.log('Worker: error when connecting to db:', err);
        }
        else{
            fetchNext();
        }
    });

}

function fetchNext(){
    if(projectQueue.length>0){
        var projectId = projectQueue.shift();
        fetchProjectData(projectId);

    }
    else{
        exitFetch();
    }
}



function exitFetch(){
    disconnect();
}

function fetchProjectData(projectId){

    console.log("projectId",projectId);
    var clsTable = 'classifications_test';

    //connection.query("SELECT UNIX_TIMESTAMP(created_at) AS time FROM "+clsTable+" WHERE project='"+projectId+"' ORDER BY time DESC LIMIT 1",function(err, rows) {
    connection.query("SELECT UNIX_TIMESTAMP(updated) as time FROM projects WHERE name='"+projectId+"'",function(err, rows) {

        if(err) {
            exitFetch();
            throw err;

        }
        var fromMs, toMs, maxDateMs, maxDataDateMs = 0;
        var curMs = (new Date()).valueOf();
        var monthMs = MONTH_SECS * 1000;// a month in ms
        var intervalMs = 25*60*60*1000; // 6 hour in ms
        var projectUpdated = rows[0].time;
        if(projectUpdated==null){

            fromMs = 1399939200000; // midnight 13 May 2014
            //(new Date()).valueOf() - monthMs;
            console.log("projectUpdated is NULL",projectUpdated);
        }
        else{
            fromMs = projectUpdated*1000;
            console.log("projectUpdated",projectUpdated);

        }
        toMs = fromMs + intervalMs; // curMs;//
        toMs = Math.min(curMs,toMs);

        maxDateMs = toMs;


        console.log("fromMs",fromMs,"toMs",toMs, "from",new Date(fromMs), "to",new Date(toMs));

        //disconnect();
        //return;

        var perPage = 10000;
        var options = {
            //url: 'http://event.zooniverse.org/classifications/'+projectId+'?from=1399939200000&to=1400025600000&per_page=200&page=1',
            url: 'http://event.zooniverse.org/classifications/'+projectId,
            qs:{'from':fromMs, 'to':toMs,'per_page':perPage,'page':1},
            //timeout:60*1000,
            headers: {
                'Accept': 'application/vnd.zooevents.v1+json'
            }
        };

        request(options, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);
                //console.log(data);

                if(data.length>0){
                    var fields = ['id','created_at','user_id','project','country_code','region','city_name','latitude','longitude'];
                    var inserts = [];
                    _.each(data,function(record){
                        var values=[];
                        _.each(fields, function(field,index){
                            var value = 'NULL';
                            if(field=='project'){
                                value = "'"+projectId+"'";
                            }
                            else if(record[field]){
                                value = "'"+record[field]+"'";
                            }
                            values.push(value);
                        });
                        // get last date from data
                        var createdDate = new Date(record['created_at']);
                        //console.log('createdMs',createdDate);
                        var createdMs = createdDate.valueOf();
                        if(createdMs>maxDataDateMs){
                            maxDataDateMs = createdMs;
                        }

                        var valuesStr = values.join(",");
                        inserts.push("("+valuesStr+")");

                    });

                    if(data.length==perPage){
                        maxDateMs = maxDataDateMs;
                        console.log('maxDataDateMs',maxDataDateMs);
                    }

                    var insertStr = inserts.join(',');
                    //console.log(insertStr);

                    connection.query("REPLACE INTO "+clsTable+" (`id`,`created_at`,`user_id`,`project`,`country`,`region`,`city`,`latitude`,`longitude`) VALUES" +insertStr,
                        function (err, rows) {

                            if (err) {
                                throw err;
                            }
                            setProjectsUpdate(projectId, maxDateMs);

                            //fetchNext();

                        });
                }
                else{ // end if(data.length>0){
                    //fetchNext();
                    setProjectsUpdate(projectId, maxDateMs);
                }

            }
            else{ // end if (!error && response.statusCode == 200) {
                console.log('fetchProjectData request error',error);//,response.statusCode);
                exitFetch();
            }

        }); // close request
    });

}

function setProjectsUpdate(projectId,updateMs){

    //var isoStr = (new Date(updateMs)).toISOString();
    var unixTime = parseInt(updateMs/1000);
    console.log('update date',projectId,new Date(unixTime*1000));
    connection.query("UPDATE projects SET `updated`= FROM_UNIXTIME('"+unixTime+"') WHERE `name`='"+projectId+"'",function (err, rows) {
        if (err) {
            console.log('setProjectsUpdate error',err);
            throw err;
        }

        fetchNext();

    });
}

function fetchProjectDataTest(){

    //curl -H "Accept: application/vnd.zooevents.v1+json"
    //"http://event.zooniverse.org/classifications/galaxy_zoo?from=1399939200000&to=1400025600000&per_page=200&page=1"

    var options = {
        //url: 'http://event.zooniverse.org/classifications/galaxy_zoo?from=1399939200000&to=1400025600000&per_page=2&page=1',
        url: 'http://event.zooniverse.org/classifications/galaxy_zoo',
        qs:{'from':1399939200000, 'to':1400025600000,'per_page':3,'page':1},
        headers: {
            'Accept': 'application/vnd.zooevents.v1+json'
        }
    };

    request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            console.log(info);

        }
    });

}


function updateTimeSeries() {


    connect();
    connection.connect(function(err) {
        if(err) {
            console.log('Worker: error when connecting to db:', err);
        }
        else{
            var intervals = [HOUR_SECS];
            seriesQueue = [];
            _.each(projectList,function(project){
                _.each(intervals,function(interval){
                    seriesQueue.push(
                        {type:'c',interval:interval, project:project},
                        {type:'u',interval:interval, project:project}
                    );

                });
            });
            updateNextTimeSeries();


        }
    });
}

function updateNextTimeSeries(){
    if (seriesQueue.length > 0){
        var series = seriesQueue.shift();
        updateTimeSeriesInterval(series);
    }
    else{
        //res.send(rows);
        endUpdateTimeSeries();
    }

}

function endUpdateTimeSeries() {
    disconnect();
    console.log('endUpdateTimeSeries');
}

function updateTimeSeriesInterval(series){

    var interval = series.interval; // seconds
    var dataType = series.type;
    var projectId = series.project;
    var from = 0, to = 0;

    // find from and to dates

    var projectUpdatedUnix = 0,seriesMax = 0;

    connection.query("SELECT UNIX_TIMESTAMP(`updated`) AS time FROM `projects` WHERE `name`='"+projectId+"'",function (err, rows) {
        if (err) {
            console.log('updateTimeSeriesInterval error',err);
            throw err;
        }
        //projectUpdatedMs = rows[0].time *1000;
        projectUpdatedUnix = rows[0].time;
        to = projectUpdatedUnix;

        var seriesTable = "timeseries_test";
        var clsTable = "classifications_test"

        connection.query("SELECT UNIX_TIMESTAMP(`datetime`) AS time FROM "+seriesTable+" WHERE project='"+projectId+"' AND `type_id`='"+dataType+"' ORDER BY time DESC LIMIT 1",function(err, rows) {
            if (err) {
                console.log('updateTimeSeriesInterval error',err);
                throw err;
            }
            if(rows[0]){
                console.log('seriesMax',rows[0]);
                seriesMax = rows[0].time;
                from = seriesMax+interval;
                console.log('from seriesMax', from);
            }
            else{
                console.log('rows[0] null',rows[0]);
                from = Math.floor(projectUpdatedUnix/interval)*interval - seriesLength[interval]*interval;
                console.log('fromMs null',from);

            }


            console.log('updateTimeSeriesIntervals',series.type, series.interval,"from",from,"to",to);


            // if interval is less than update period,  start next project
            if(to-from<interval){
                updateNextTimeSeries();
            }
            else{
                var dataQuery = "";
                switch(dataType){
                    case "c":
                        dataQuery = "COUNT(*) AS count";
                        break;
                    case "u":
                        dataQuery = "COUNT(DISTINCT user_id) as count";
                        break;
                    default:
                        //res.send([]);
                        return;
                }

                /*
                var query = "SELECT "+dataQuery+",project,FLOOR((UNIX_TIMESTAMP(created_at)-"+from+")/"+interval+") AS time "+
                    "FROM "+clsTable+" WHERE created_at BETWEEN FROM_UNIXTIME("+from+") AND FROM_UNIXTIME("+to+")"+
                    "GROUP BY time,project";
                    */
                var query = "SELECT "+dataQuery+",project,FLOOR((UNIX_TIMESTAMP(created_at)-"+from+")/"+interval+") AS time "+
                    "FROM "+clsTable+" WHERE project='"+projectId+"' AND created_at BETWEEN FROM_UNIXTIME("+from+") AND FROM_UNIXTIME("+to+")"+
                    "GROUP BY time";
                console.log("query",query);
                connection.query(query, function(err, rows, fields) {
                    if(err) throw err;
                    _.map(rows,function(item){
                        //console.log("time bucket",item.time);
                        item.time = parseFloat(item.time)*interval + from;
                        //console.log('date',item.date,'count',item.count,"time",item.time);
                    });

                    var minTimeMs = from*1000;
                    var nBars = (to-from)/interval;
                    console.log('nBars',nBars);
                    var projects = {};

                    var projectsObj = _.countBy(rows,'project');

                    // create date series
                    _.each(projectsObj,function(val,project){

                        var values = [];
                        for(var i=0;i<nBars;i++){

                            var unixtime = from+interval*i;
                            values.push({"unixtime":unixtime,"value":0});
                            //console.log('unixtime',unixtime);
                        }

                        var series = {
                            key: project,
                            values: values
                        };
                        projects[project] = series;
                    });

                    // add counts to date series
                    _.each(rows,function(row){

                        var series = projects[row.project];
                        var item = _.find(series.values,{'unixtime':row.time});
                        //console.log('unixtime',row.time);
                        if(item){
                            item.value = row.count;
                        }
                        //console.log('row.date',row.date);



                    });

                    var unixNow = parseInt(new Date().valueOf()/1000);
                    //console.log('unixNow',unixNow);

                    // create mysql inserts
                    // INSERT INTO tbl_name (a,b,c) VALUES(1,2,3),(4,5,6),(7,8,9);

                    var inserts = [];
                    _.each(projects,function(project){
                        _.each(project.values,function(item){
                            inserts.push("('"+dataType+"','"+project.key+"','"+interval+"',FROM_UNIXTIME('"+ item.unixtime+"'),'"+item.value+"',FROM_UNIXTIME('"+unixNow+"'))");
                        });
                    });

                    var insertStr = inserts.join(',');
                    //console.log(insertStr);

                    connection.query("INSERT INTO "+seriesTable+" (`type_id`,`project`,`interval`,`datetime`,`count`,`updated`) VALUES" +insertStr,
                        function (err, rows) {

                            if (err) throw err;


                            // delete excess series data

                            // find last item in series
                            var lastItemTime = 0;
                            var offset = seriesLength[interval] -1;

                            connection.query("SELECT UNIX_TIMESTAMP(`datetime`) AS time FROM "+seriesTable+" WHERE `project`='"+projectId+"' AND type_id='"+dataType+"' AND `interval`='"+interval+"' ORDER BY `datetime` DESC LIMIT 1 OFFSET "+offset,function(err, rows, fields) {

                                if(err) throw err;
                                // if rows to delete
                                if(rows[0]){
                                    lastItemTime = rows[0].time;
                                    console.log('lastItemTime: ', lastItemTime,'type',dataType,'interval',interval);

                                    // delete records past series length
                                    var query = "DELETE FROM "+seriesTable+" WHERE `datetime` > FROM_UNIXTIME('"+lastItemTime+"') AND `project`='"+projectId+"' AND `type_id`='"+dataType+"' AND `interval`='"+interval+"'";

                                    console.log(query);
                                    connection.query(query, function(err, rows, fields) {

                                        if(err) throw err;
                                        updateNextTimeSeries();

                                    });
                                }
                                else{
                                    updateNextTimeSeries();
                                }
                            });



                        });

                });
            } // close if(to-from<interval){
        }); // close connection.query("SELECT UNIX_TIMESTAMP(`datetime`) AS time FROM "+seriesTable+"
    }); // close connection.query("SELECT UNIX_TIMESTAMP(`updated`)

}


function getZooonAPIProjects(){

    connect();
    connection.connect(function(err) {
        if(err) {
            console.log('Worker: error when connecting to db:', err);
        }
        else{
            var options = {
                url: 'https://api.zooniverse.org/projects/list'
            };

            request(options, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var data = JSON.parse(body);
                    console.log(data);

                    if(data.length>0){
                        var fields = ['id','name','display_name'];
                        var inserts = [];
                        _.each(data,function(record){
                            var values=[];
                            _.each(fields, function(field,index){
                                var value = 'NULL';
                                if(record[field]){
                                    value = "'"+record[field]+"'";
                                }
                                values.push(value);
                            });

                            var valuesStr = values.join(",");
                            inserts.push("("+valuesStr+")");

                        });

                        var insertStr = inserts.join(',');
                        console.log(insertStr);

                        connection.query("INSERT IGNORE INTO projects (`id`,`name`,`display_name`) VALUES" +insertStr,
                            function (err, rows) {
                                if (err) {
                                    throw err;
                                }
                                disconnect();

                        });
                    }



                }
            });
        }
    });
}


//getZoonTest();

//startFetch();

loadProjects();