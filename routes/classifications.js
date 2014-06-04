
//https://www.npmjs.org/package/node-mysql
//https://github.com/felixge/node-mysql

var _ = require('lodash');

var mysql      = require('mysql');
var parseDbUrl = require('parse-database-url');

var WNU_DB_URL = process.env.WNU_DB_URL;
var dbConfig = parseDbUrl(WNU_DB_URL);

// need to parse dbname out of connection string
var WNU_DB_NAME = dbConfig['database'];

//var WNU_DB_NAME = 'heroku_1b240db52f66cb2'


var connection;


function handleDisconnect() {
    connection = mysql.createConnection(WNU_DB_URL); // Recreate the connection, since
    // the old one cannot be reused.

    connection.connect(function(err) {              // The server is either down
        if(err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
    // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

handleDisconnect();



exports.getClassificationCount = function(req, res) {
    connection.query('SELECT COUNT(*) AS count FROM ??',['classifications'], function(err, rows, fields) {
        if(err) throw err;
        console.log('Classification count: ', rows[0].count);
        res.send(rows);
    });
}

exports.getClassificationCountLatest = function(req, res) {

    var seconds = parseInt(req.params.seconds);

    if(isNaN(seconds)){
        res.send([]);
        return;
    }

    var maxTimeUnix = 0;
    connection.query("SELECT UNIX_TIMESTAMP(created_at) AS time FROM classifications ORDER BY time DESC LIMIT 1",function(err, rows, fields) {

        if(err) throw err;
        maxTimeUnix = rows[0].time;
        console.log('maxTimeUnix: ', maxTimeUnix);

        var unixTime = maxTimeUnix-seconds;
        console.log('unixTime: ', unixTime);

        connection.query("SELECT count(*) AS count,project,country "+
            "FROM classifications WHERE created_at > FROM_UNIXTIME("+unixTime+")"+
            "GROUP BY project,country", function(err, rows, fields) {

            if(err) throw err;
            res.send(rows);

        });
    });

}


exports.getLastClassifications = function(req, res) {
    var count = parseInt(req.params.count);
    var offset = parseInt(req.params.offset);

    if(isNaN(count) || isNaN(offset)){
        res.send([]);
        return;
    }
    console.log('Retrieving last ' + count + ' classifications, offset: ' + offset);

    connection.query("SELECT * FROM ?? LIMIT "+offset+","+count,['classifications'], function(err, rows, fields) {
    //connection.query('SELECT * FROM ?? LIMIT ?,?',['classifications',offset,count], function(err, rows, fields) {

        if(err) throw err;
        res.send(rows);
    });

};

exports.getClassificationInterval = function(req, res) {

    // http://localhost:3000/classifications/from/1348790400/to/1348876800/interval/3600

    var from = parseInt(req.params.from); // unixTime
    var to = parseInt(req.params.to); // unixTime
    var interval = parseInt(req.params.interval); // seconds

    // from = 1348790400; //'2012-09-28'
    // to = 1348876800; //'2012-09-29'

    if(isNaN(from) || isNaN(to) || isNaN(interval)){
        res.send([]);
        return;
    }
    console.log('from: ' + from + ' to: ' + to, ' interval:' + interval);

    //http://stackoverflow.com/questions/2579803/group-mysql-data-into-arbitrarily-sized-time-buckets
    /*
    connection.query('SET time_zone = "+00:00"',function(err, rows, fields){
        console.log(err);
    });
    */


    connection.query("SELECT count(*) AS count,project,FLOOR(UNIX_TIMESTAMP(created_at)/"+interval+") AS time "+
    "FROM classifications WHERE created_at BETWEEN FROM_UNIXTIME("+from+") AND FROM_UNIXTIME("+to+")"+
    "GROUP BY time,project", function(err, rows, fields) {
        if(err) throw err;
        _.map(rows,function(item){
            //console.log("divided time",item.time);
            item.time = parseFloat(item.time)*interval;
            item.date = new Date(item.time*1000).toISOString();
            //console.log('date',item.date,'count',item.count,"time",item.time);
        });

        var minTimeMs = from*1000;
        var nBars = (to-from)/interval;
        console.log('nBars',nBars);
        var projects = {};

        var projectsObj = _.countBy(rows,'project');

        _.each(projectsObj,function(val,project){

            var values = [];
            for(var i=0;i<nBars;i++){
                var time = new Date(minTimeMs+interval*1000*i);
                //time = new Date( Date.UTC(time.getFullYear(), time.getMonth(),time.getDate(),time.getHours(),time.getMinutes(), time.getSeconds()));

                var timeStr = time.toISOString();
                values.push({"label":timeStr,"value":0});
                //console.log('timeStr',timeStr);
            }

            var series = {
                key: project,
                values: values
            };
            projects[project] = series;
        });

        _.each(rows,function(row){

            var series = projects[row.project];
            var item = _.find(series.values,{'label':row.date});
            if(item){
                item.value = row.count;
            }
            //console.log('row.date',row.date);

        });

        var output = [];

        _.each(projects,function(val,project){
            output.push(projects[project]);
        });
        res.send(output);

    });

};

exports.getDBstats = function(req, res) {
    var output = [];
    connection.query('SELECT project, COUNT(*) AS totalclassifications, MIN(created_at) as first, MAX(created_at) as last FROM ?? group by project order by last desc',['classifications'], function(err, rows, fields) {
        if(err) throw err;
        console.log('Classification count: ', rows[0].totalclassifications, ' first: ', rows[0].first, ' last: ', rows[0].last);
	output.push(rows);
	connection.query("SELECT (data_length+index_length)/power(1024,2) tablesize_mb from information_schema.tables where table_schema=? and table_name='classifications'", [WNU_DB_NAME], function(error, rows, fields){
		if(err) throw err;
		console.log('DB size (mb) on disk: ', rows[0].tablesize_mb);
		output.push(rows[0]);
		res.send(output);
	    });
    });

};

exports.updateAnalytics = function(req, res) {

    connection.query("TRUNCATE `analytics`",function(err) {

        if(err) throw err;


        var intervals = [1,12,24,24*7,24*30]; // hours
        //var intervals = [1]; // hours
        var types = ['c','u']; // classifications, users
        var list = [];

        for(var t=0;t<types.length;t++){
            for(var i=0;i<intervals.length;i++){
                list.push({type:types[t],interval:intervals[i]});
                console.log(types[t],intervals[i]);
            }
        }

        updateAnalyticsIntervals(res,list);

    });



}


function updateAnalyticsIntervals(res,analyticsArray){
    var analytics = analyticsArray.shift();
    var interval = analytics.interval;
    var dataType = analytics.type;
    var seconds = interval*60*60;

    console.log('updateAnalyticsIntervals',analytics.type, analytics.interval);
    /*
    switch(interval){
        case 'd': // day
            seconds = 60*60*24;
            break;
        case 'w': // week
            seconds = 60*60*24*7;
            break;
        case 'm': // month
            seconds = 60*60*24*7*30;
            break;
    }
    */


    var maxTimeUnix = 0;
    // type, project, interval, country, count
    connection.query("SELECT UNIX_TIMESTAMP(created_at) AS time FROM classifications ORDER BY time DESC LIMIT 1",function(err, rows, fields) {

        if(err) throw err;
        maxTimeUnix = rows[0].time;
        console.log('maxTimeUnix: ', maxTimeUnix);

        var unixTime = maxTimeUnix-seconds;
        console.log('unixTime: ', unixTime);

        var dataQuery = "";
        var dataId = "";
        switch(dataType){
            case "c":
                dataQuery = "COUNT(*) AS count";
                dataId = "c";
                break;
            case "u":
                dataQuery = "COUNT(DISTINCT user_id) as count";
                dataId = "u";
                break;
        }

        connection.query("INSERT INTO analytics (`type_id`,`project`,`interval`,`country`,`count`,`updated`)"+
            "SELECT '"+dataId+"',project,'"+interval+"',country,"+dataQuery+",NOW() "+
            "FROM classifications WHERE created_at > FROM_UNIXTIME("+unixTime+")"+
            "GROUP BY project,country", function(err, rows, fields) {

            if(err) throw err;
            if(analyticsArray.length>0){
                updateAnalyticsIntervals(res,analyticsArray);
            }
            else{
                res.send(rows);
            }

        });
    });
}

function testUserAnalytics(res){
    connection.query("INSERT INTO analytics (`type_id`,`project`,`interval`,`country`,`count`) "+
        "SELECT '1',project,'d',country,COUNT(DISTINCT user_id) as count "+
        "FROM classifications "+
        "GROUP BY project,country", function(err, rows, fields) {

        if(err) throw err;

        res.send(rows);


    });

}

exports.getAnalytics = function(req, res) {

    connection.query("SELECT `type_id`,`interval`,`project`,`country`,`count` FROM `analytics`",function(err, rows, fields) {
        if(err) throw err;
        res.send(rows);

    });

}

exports.getAnalyticsAggregateCountries = function(req, res) {

    connection.query("SELECT `project`,`type_id`,`interval`,SUM(`count`) as count FROM `analytics` GROUP BY `project`,`interval`,`type_id`",function(err, rows, fields) {
        if(err) throw err;
        res.send(rows);
    });
}

exports.cleanUp = function() {
    console.log('Checking for open DB connections');
    if (null != connection){
	console.log('Closing DB connection');
	connection.end();
    }
}