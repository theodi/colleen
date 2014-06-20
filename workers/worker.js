
// https://github.com/mikeal/request
var request = require('request');
var _ = require('lodash');
var mysql      = require('mysql');
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


var connection;


function connect(){
    connection = mysql.createConnection(WNU_DB_URL); // Recreate the connection, since the old one cannot be reused.
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


//testQuery();


function startFetch(){
    var projectIds = ['galaxy_zoo','milky_way'];//['cyclone_center', 'galaxy_zoo', 'mergers', 'milky_way', 'moon_zoo', 'planet_hunters', 'sea_floor_explorer', 'solar_storm_watch', 'whalefm'];

    connect();
    connection.connect(function(err) {              // The server is either down
        if(err) {                                     // or restarting (takes a while sometimes).
            console.log('Worker: error when connecting to db:', err);
        }
        else{
            fetchProjects(projectIds)
        }
    });

}

function fetchNext(projectIds){
    if(projectIds.length>0){
        fetchProjects(projectIds);

    }
    else{
        exitFetch();
    }
}

function exitFetch(){
    disconnect();
}

function fetchProjects(projectIds){
    var projectId = projectIds.shift();
    console.log("projectId",projectId);
    var clsTable = 'classifications2';

    connection.query("SELECT UNIX_TIMESTAMP(created_at) AS time FROM "+clsTable+" WHERE project='"+projectId+"' ORDER BY time DESC LIMIT 1",function(err, rows) {

        if(err) {
            throw err;
        }
        var fromMs, toMs;
        var curMs = (new Date()).valueOf();
        var monthMs = MONTH_SECS * 1000;// a month in ms
        var intervalMs = 60*60*1000; // 10 mins in ms
        if(!rows[0]){
            fromMs = (new Date()).valueOf() - monthMs;

        }
        else{
            fromMs = rows[0].time*1000;

        }
        toMs = curMs;//fromMs + intervalMs;
        //toMs = Math.min(curMs,toMs);

        console.log("fromMs",fromMs,"toMs",toMs);


        var options = {
            //url: 'http://event.zooniverse.org/classifications/galaxy_zoo?from=1399939200000&to=1400025600000&per_page=2&page=1',
            url: 'http://event.zooniverse.org/classifications/'+projectId,
            qs:{'from':fromMs, 'to':toMs,'per_page':2000,'page':1},
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

                        var valuesStr = values.join(",");
                        inserts.push("("+valuesStr+")");


                    });

                    var insertStr = inserts.join(',');
                    //console.log(insertStr);

                    connection.query("INSERT INTO "+clsTable+" (`id`,`created_at`,`user_id`,`project`,`country`,`region`,`city`,`latitude`,`longitude`) VALUES" +insertStr,
                        function (err, rows) {

                            if (err) throw err;
                            fetchNext(projectIds);


                        });
                }
                else{
                    fetchNext(projectIds);
                }

            }
        });
    });

}

function getZoonTest(){

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


//getZoonTest();

startFetch();