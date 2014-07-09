
// https://github.com/mikeal/request
var request = require('request');
var _ = require('lodash');
var mysql      = require('mysql');
var fs = require('fs');
var events = require('events');

//var parseDbUrl = require('parse-database-url');

var WNU_DB_URL = process.env.WNU_DB_URL;
//var dbConfig = parseDbUrl(WNU_DB_URL);

// parse dbname out of connection string
//var WNU_DB_NAME = dbConfig['database'];

/*---------------------------------------------------------------------------*/

// Constants and globals

var MIN_SECS = 60,
    MIN_5_SECS = 300,
    MIN_15_SECS = 900,
    HOUR_SECS = 3600,
    DAY_SECS = 86400,
    WEEK_SECS = 604800,
    MONTH_SECS = 2592000; // month 30 days

var seriesLength={};
seriesLength[MIN_SECS] = 60, seriesLength[MIN_5_SECS] = 60, seriesLength[MIN_15_SECS] = 60, seriesLength[HOUR_SECS] = 24, seriesLength[DAY_SECS] = 30;

var gProjectList = [], gProjectQueue = [], gSeriesQueue = [];

var gIntervals = [MIN_SECS,MIN_15_SECS,HOUR_SECS,DAY_SECS];
var gTimer = 0;

var gEventEmitter = new events.EventEmitter();

var gClsArchiveTime = DAY_SECS*60;

/*---------------------------------------------------------------------------*/

// MySQL connection

var connection = null;
var gSeriesTable = "timeseries";
var gClsTable = "classifications";
var gProjectTable = "projects";


console.log('WNU_DB_URL',WNU_DB_URL);
function connect(){
    if(connection!=null){
        disconnect();
    }
    connection = mysql.createConnection(WNU_DB_URL+'?timezone=+0000'); // Recreate the connection, since the old one cannot be reused.

    /*
    connection.connect(function(err) {              // The server is either down
        if(err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(connect, 2000); // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
    });

                                        // process asynchronous requests in the meantime.
    // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            connect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
    */
}

function disconnect(){
    console.log('Worker: Checking for open DB connections');
    if (connection != null){
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



/*---------------------------------------------------------------------------*/

// Load projects to fetch from zoon event API
// ./data/projects.json

function startWorker(){

    /*
    // SET GLOBAL time_zone = '+00:00';
    connect();
    connection.connect(function(err) {
        if(err) {
            console.log('Worker: error startWorker:', err);
        }
        connection.query("SET GLOBAL time_zone = '+00:00'",function(err, rows) {
            if(err) {
                console.log('Worker: error SET GLOBAL time_zone:', err);
            }
            console.log('SET GLOBAL time_zone');
            loadProjects(startScheduler);
        });

    });
    */

    loadProjects(startScheduler);
}

function loadProjects(callback){

    var filename = '/../data/projects.json';

    fs.readFile(__dirname + filename, 'utf8', function (err, data) {
        if (err) {
            console.log('Error loading projects.json: ' + err);
            return;
        }

        gProjectList = JSON.parse(data);

        console.log(gProjectList);

        callback.call();


    });
}

// start worker
 startWorker();

/*---------------------------------------------------------------------------*/

// Scheduling

// Cron

//var CronJob = require('cron').CronJob;
//new CronJob('*/2 * * * * *', function(){
//    var date = new Date();
//    console.log("date:", date, date.valueOf());
//
//}, null, false);//, "UTC");

function startLoop(){
    var dt = 20*1000;
    setInterval(function(){
        console.log("Start fetch, date:", new Date());
    },dt);
}

function startScheduler(){

    gProjectTable = "projects";
    gClsTable = "classifications_test";
    gSeriesTable = "timeseries_test";


    var timeout = 5*1000;
    var updateCount = 0;

    var fetchDataTimeout = function(){
        console.log("testFetchData:", new Date(),"updateCount",updateCount);
        updateCount +=1;
        setTimeout(startFetch,timeout);
    };

    gEventEmitter.on('endFetchData', startUpdateTimeSeries);

    gEventEmitter.on('endUpdateTimeSeries', fetchDataTimeout);

    fetchDataTimeout();


}




/*---------------------------------------------------------------------------*/

// Fetch classification data from zoon API, insert into classification table


function startFetch(){

    gTimer = new Date().valueOf();
    gProjectQueue = _.clone(gProjectList);

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
    if(gProjectQueue.length>0){
        var projectId = gProjectQueue.shift();
        fetchProjectData(projectId);

    }
    else{
        endFetch();
    }
}

function endFetch(){
    //startUpdateTimeSeries();

    var dt = (new Date().valueOf() - gTimer)/1000;
    console.log('endFetchData. Time taken (s):',dt);
    gEventEmitter.emit('endFetchData');

}

function fetchProjectData(projectId){

    console.log("fetchProjectData",projectId);

    //connection.query("SELECT UNIX_TIMESTAMP(created_at) AS time FROM "+gClsTable+" WHERE project='"+projectId+"' ORDER BY time DESC LIMIT 1",function(err, rows) {
    connection.query("SELECT UNIX_TIMESTAMP(updated) as time FROM "+gProjectTable+" WHERE name='"+projectId+"'",function(err, rows) {

        if(err) {
            endFetch();
            throw err;

        }
        var fromMs, toMs, maxDateMs, maxDataDateMs = 0;
        var curMs = (new Date()).valueOf();
        var monthMs = MONTH_SECS * 1000;// a month in ms
        var intervalMs = 30*60*1000; // 15 mins in ms
        var projectUpdated = rows[0].time;
        if(projectUpdated==null){


            fromMs = 1398902400000;// 2014/05/01 // 1399939200000; // midnight 13 May 2014//1404543600000;// 2014/07/05 7am // 1399982400000; // 12pm 13 May 2014 //
            //fromMs = (new Date()).valueOf() - monthMs;
            console.log("projectUpdated is NULL",projectUpdated);
        }
        else{
            fromMs = projectUpdated*1000;
            //console.log("projectUpdated",projectUpdated);

        }
        toMs = fromMs + intervalMs; // curMs;//
        toMs = Math.min(curMs,toMs);

        maxDateMs = toMs;


        console.log(projectId,"fromMs",fromMs,"toMs",toMs, "from",new Date(fromMs), "to",new Date(toMs));

        //disconnect();
        //return;

        var perPage = 5000; // 5000
        var options = {
            //url: 'http://event.zooniverse.org/classifications/'+projectId+'?from=1399939200000&to=1400025600000&per_page=200&page=1',
            url: 'http://event.zooniverse.org/classifications/'+projectId,
            //qs:{'from':fromMs, 'to':toMs},//,'per_page':perPage,'page':1},
            qs:{'from':fromMs, 'to':toMs,'per_page':perPage,'page':0},
            timeout:20*1000,
            headers: {
                'Accept': 'application/vnd.zooevents.v1+json'
            }
        };

        request(options, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);
                //console.log('Classifications:',data);
                //console.log('Classifications, data:',data);
                //console.log('Classifications, data[0]:',data[0]);
                console.log('Classifications, data.length:',data.length);

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
                                value = connection.escape(record[field]);//"'"+connection.escape(record[field])+"'";
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

                    connection.query("REPLACE INTO "+gClsTable+" (`id`,`created_at`,`user_id`,`project`,`country`,`region`,`city`,`latitude`,`longitude`) VALUES" +insertStr,
                        function (err, rows) {

                            if (err) {
                                throw err;
                            }
                            //setProjectsUpdateTime(projectId, maxDateMs);
                            removeClassifications(projectId, maxDateMs);



                        });
                }
                else{ // end if(data.length>0){

                    //setProjectsUpdateTime(projectId, maxDateMs);
                    removeClassifications(projectId, maxDateMs);
                }

            }
            else{ // end if (!error && response.statusCode == 200) {
                console.log('fetchProjectData request error',error);//,response.statusCode);
                //endFetch();
                removeClassifications(projectId, maxDateMs);
            }

        }); // close request
    });

}

function removeClassifications(projectId,updateMs){

    //console.log('removeClassifications: ',projectId, updateMs, new Date(updateMs));
    var lastClsTime = parseInt(updateMs/1000)-gClsArchiveTime;
    console.log('removeClassifications from: ',projectId, lastClsTime, new Date(lastClsTime*1000));

    // delete classifications past max interval
    var query = "DELETE FROM "+gClsTable+" WHERE `created_at` < FROM_UNIXTIME('"+lastClsTime+"') AND `project`='"+projectId+"'";

    //console.log(query);
    connection.query(query, function(err, rows) {

        if(err) throw err;
        //console.log("removeClassifications result:",rows);
        setProjectsUpdateTime(projectId,updateMs)

    });



}

function setProjectsUpdateTime(projectId,updateMs){

    var unixTime = parseInt(updateMs/1000);
    console.log('update date',projectId,new Date(unixTime*1000));
    var query = "UPDATE `"+gProjectTable+"` SET `updated`= FROM_UNIXTIME('"+unixTime+"') WHERE `name`='"+projectId+"'";
    console.log(query);
    connection.query(query,function (err, rows) {
        if (err) {
            console.log('setProjectsUpdateTime error',err);
            throw err;
        }

        fetchNext();

    });
}

function fetchProjectDataTest(){

    //curl -H "Accept: application/vnd.zooevents.v1+json"
    //"http://event.zooniverse.org/classifications/galaxy_zoo?from=1399939200000&to=1400025600000&per_page=200&page=1"

    //var from = 1400889600000, to = 1400976000000; // 2014/05/24 00:00 to 2014/05/25 00:00
    var from = 1401235200000, to = 1401321600000; // 2014/05/28 00:00 to 2014/05/29 00:00

    var options = {
        //url: 'http://event.zooniverse.org/classifications/galaxy_zoo?from=1399982400000&to=1399983000000&page=1',//&per_page=10&page=1',
        url: 'http://event.zooniverse.org/classifications/galaxy_zoo',
        //qs:{'from':1399939200000, 'to':1400025600000,'per_page':2000,'page':1},
        //qs:{'from':1399982400000, 'to':1399986000000,'per_page':5000,'page':0},// Tue, 13 May 2014 12:00:00 GMT 1 hour
        //qs:{'from':1399982400000, 'to':1400004000000,'per_page':8000,'page':0},// Tue, 13 May 2014 12:00:00 GMT 1 hour
        //qs:{'from':1399982400000, 'to':1399982520000},//,'per_page':100,'page':1},// Tue, 13 May 2014 00:00:00 GMT 10 mins

        qs:{'from':from, 'to':to,'per_page':1000,'page':0},


        headers: {
            'Accept': 'application/vnd.zooevents.v1+json'
        }
    };

    request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log("body.length",body.length);

            var data = JSON.parse(body);
            //console.log(data);
            //console.log('data[0]',data[0]);
            console.log('data.length',data.length,'from',new Date(from), 'to',new Date(to));

        }
    });

}

function testFetchData(){

    console.log("Start testFetchData");
    gProjectTable = "projects";
    gClsTable = "classifications";

    var updateCount = 0;

    // projects: ["andromeda","bat_detective","cyclone_center","galaxy_zoo","milky_way","planet_four","sea_floor","serengeti"]

    var testFetchDataLoop = function(){
        console.log("testFetchData:", new Date(),"updateCount",updateCount);
        updateCount +=1;
        setTimeout(startFetch,5*1000);
    };

    gEventEmitter.on('endFetchData', testFetchDataLoop);

    testFetchDataLoop();

}

//loadProjects(testFetchData);
//fetchProjectDataTest();

/*---------------------------------------------------------------------------*/

// Update time-series

function startUpdateTimeSeries(){

    connect();

    gTimer = new Date().valueOf();
    connection.connect(function(err) {
        if(err) {
            console.log('Worker: error when connecting to db:', err);
            //throw err;
        }
        else{

            gSeriesQueue = [];
            _.each(gProjectList,function(project){
                _.each(gIntervals,function(interval){
                    gSeriesQueue.push(
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
    if (gSeriesQueue.length > 0){
        var series = gSeriesQueue.shift();
        updateTimeSeries(series);
    }
    else{
        endUpdateTimeSeries();
    }

}

function endUpdateTimeSeries() {
    disconnect();
    var dt = (new Date().valueOf() - gTimer)/1000;
    console.log('endUpdateTimeSeries. Time taken (s):',dt);
    gEventEmitter.emit('endUpdateTimeSeries');
}

function updateTimeSeries(series){

    var interval = series.interval; // seconds
    var dataType = series.type;
    var projectId = series.project;
    var from = 0, to = 0;

    // find from and to dates

    var projectUpdatedUnix = 0,seriesMax = 0;

    connection.query("SELECT UNIX_TIMESTAMP(`updated`) AS time FROM `"+gProjectTable+"` WHERE `name`='"+projectId+"'",function (err, rows) {
        if (err) {
            console.log('updateTimeSeriesInterval error',err);

        }
        //projectUpdatedMs = rows[0].time *1000;
        projectUpdatedUnix = rows[0].time;
        to = projectUpdatedUnix;


        // find last timeseries date
        connection.query("SELECT UNIX_TIMESTAMP(`datetime`) AS time FROM "+gSeriesTable+" WHERE project='"+projectId+
            "' AND `type_id`='"+dataType+"'  AND `interval`='"+interval+"' ORDER BY time DESC LIMIT 1",function(err, rows) {
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

                from = Math.floor(projectUpdatedUnix/interval)*interval - seriesLength[interval]*interval;
                console.log('from, no seriesMax',from);

            }


            console.log(projectId,"updateTimeSeriesIntervals",series.type, series.interval,"from",from,"to",to,"from",new Date(from*1000),"to",new Date(to*1000));


            // if interval is less than update period,  start next project
            if(to-from<interval){
                updateNextTimeSeries();
            }
            else{
                updateTimeSeriesInterval(series,from,to);

            } // close if(to-from<interval){
        }); // close connection.query("SELECT UNIX_TIMESTAMP(`datetime`) AS time FROM "+gSeriesTable+"
    }); // close connection.query("SELECT UNIX_TIMESTAMP(`updated`)

}

function updateTimeSeriesInterval(series, from, to){

    var interval = series.interval; // seconds
    var dataType = series.type;
    var projectId = series.project;

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

    var query = "SELECT "+dataQuery+",project,FLOOR((UNIX_TIMESTAMP(created_at)-"+from+")/"+interval+") AS time "+
        "FROM "+gClsTable+" WHERE project='"+projectId+"' AND created_at BETWEEN FROM_UNIXTIME("+from+") AND FROM_UNIXTIME("+to+") "+
        "GROUP BY time";
    //console.log("query",query);
    connection.query(query, function(err, rows, fields) {
        if(err) throw err;
        _.map(rows,function(item){
            //console.log("time bucket",item.time);
            item.time = parseFloat(item.time)*interval + from;
            //console.log('date',item.date,'count',item.count,"time",item.time);
        });

        var minTimeMs = from*1000;
        var nItems = (to-from)/interval;
        console.log('Series length',nItems);


        var values = [];
        for(var i=0;i<nItems;i++){

            var unixtime = from+interval*i;
            values.push({"unixtime":unixtime,"value":0});
            //console.log('unixtime',unixtime);
        }


        // add counts to date series
        _.each(rows,function(row){

            var item = _.find(values,{'unixtime':row.time});
            //console.log('unixtime',row.time);
            if(item){
                item.value = row.count;
            }

        });

        var unixNow = parseInt(new Date().valueOf()/1000);
        //console.log('unixNow',unixNow);

        // create mysql inserts
        // INSERT INTO tbl_name (a,b,c) VALUES(1,2,3),(4,5,6),(7,8,9);

        var inserts = [];
        _.each(values,function(item){
            inserts.push("('"+dataType+"','"+projectId+"','"+interval+"',FROM_UNIXTIME('"+ item.unixtime+"'),'"+item.value+"',FROM_UNIXTIME('"+unixNow+"'))");
        });


        var insertStr = inserts.join(',');
        //console.log(insertStr);

        connection.query("INSERT INTO "+gSeriesTable+" (`type_id`,`project`,`interval`,`datetime`,`count`,`updated`) VALUES" +insertStr,
            function (err, rows) {

                if(err){
                    console.log('Insert Error, updateTimeSeriesInterval', err);
                    throw err;
                }

                removeTimeSeriesItems(series);

            });

    });
}


function removeTimeSeriesItems(series){

    var interval = series.interval; // seconds
    var dataType = series.type;
    var projectId = series.project;

    // delete excess series data

    // find last item in series
    var lastItemTime = 0;
    var offset = seriesLength[interval] -1;

    connection.query("SELECT UNIX_TIMESTAMP(`datetime`) AS time FROM "+gSeriesTable+" WHERE `project`='"+projectId+"' AND type_id='"+dataType+"' AND `interval`='"+interval+"' ORDER BY `datetime` DESC LIMIT 1 OFFSET "+offset,function(err, rows, fields) {

        if(err) throw err;
        // if rows to delete
        if(rows[0]){
            lastItemTime = rows[0].time;
            console.log(projectId, 'lastItemTime: ', lastItemTime,'type',dataType,'interval',interval, new Date(lastItemTime*1000));

            // delete records past series length
            var query = "DELETE FROM "+gSeriesTable+" WHERE `datetime` < FROM_UNIXTIME('"+lastItemTime+"') AND `project`='"+projectId+"' AND `type_id`='"+dataType+"' AND `interval`='"+interval+"'";

            //console.log(query);
            connection.query(query, function(err, rows) {

                if(err) throw err;
                updateNextTimeSeries();

            });

        }
        else{
            updateNextTimeSeries();
        }
    });

}

function testUpdateTimeSeries(){

    console.log("Start testUpdateTimeSeries");
    gProjectTable = "projects";
    gClsTable = "classifications_test";
    gSeriesTable = "timeseries_test";
    var classificationTime = parseInt(new Date(Date.UTC(2013,2,10,0,0,0))/1000); // 2013/03/10 // 2014-05-14 00:00:00
    var classificationInterval = 15*60; // secs

    var updateCount = 0, nUpdates = 60;

    // projects: ["andromeda","bat_detective","cyclone_center","galaxy_zoo","milky_way","planet_four","sea_floor","serengeti"]
    // Initial run time: 181.74 secs. 2784 rows.
    // Update minutes only: 35.767 secs


    var testUpdateTimeSeriesLoop = function(){
        console.log("testUpdateTimeSeries:", new Date(), "classificationTime",classificationTime,"updateCount",updateCount);
        var query = "UPDATE `"+gProjectTable+"` SET `updated`=FROM_UNIXTIME('"+classificationTime+"')";

        connect();
        connection.connect(function(err) {
            console.log("UPDATE query",query);
            connection.query(query,function(err, rows) {

                classificationTime += classificationInterval;

                updateCount +=1;
                //disconnect();

                setTimeout(startUpdateTimeSeries,5*1000);

                /*
                if(updateCount >= nUpdates){
                    //clearInterval(intervalObj);
                    gEventEmitter.removeListener('endUpdateTimeSeries', testUpdateTimeSeriesLoop);
                    console.log("End testUpdateTimeSeries");
                }
                else{
                    setTimeout(startUpdateTimeSeries,5*1000);
                }
                */
            });
        });
    };

    gEventEmitter.on('endUpdateTimeSeries', testUpdateTimeSeriesLoop);

    testUpdateTimeSeriesLoop();

}

//loadProjects(testUpdateTimeSeries);

/*---------------------------------------------------------------------------*/

// Insert zoon API projects into projects table

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

                        connection.query("INSERT IGNORE INTO "+gProjectTable+" (`id`,`name`,`display_name`) VALUES" +insertStr,
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

