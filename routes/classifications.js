
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

var MIN_SECS = 60,
    MIN_15_SECS = 900,
    HOUR_SECS = 3600,
    DAY_SECS = 86400,
    WEEK_SECS = 604800,
    MONTH_SECS = 2592000; // month 30 days


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

    // http://localhost:5000/classifications/from/1346457600/to/1348876800/interval/604800 // week interval
    // http://localhost:5000/classifications/from/1348790400/to/1348876800/interval/3600 // hour interval

    var from = parseInt(req.params.from); // unixTime
    var to = parseInt(req.params.to); // unixTime
    var interval = parseInt(req.params.interval); // seconds

    // from = 1346457600; //'2012-09-01'
    // from = 1348790400; //'2012-09-28'
    // to = 1348876800; //'2012-09-29'

    if(isNaN(from) || isNaN(to) || isNaN(interval)){
        res.send([]);
        return;
    }
    console.log('from: ' + from + ' to: ' + to, ' interval:' + interval);

    //http://stackoverflow.com/questions/2579803/group-mysql-data-into-arbitrarily-sized-time-buckets


    connection.query("SELECT count(*) AS count,project,FLOOR((UNIX_TIMESTAMP(created_at)-"+from+")/"+interval+") AS time "+
        "FROM classifications WHERE created_at BETWEEN FROM_UNIXTIME("+from+") AND FROM_UNIXTIME("+to+")"+
        "GROUP BY time,project", function(err, rows, fields) {
        if(err) throw err;
        _.map(rows,function(item){
            //console.log("divided time",item.time);
            item.time = parseFloat(item.time)*interval + from;
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




function testUserAnalytics(res){
    connection.query("INSERT INTO analytics (`type_id`,`project`,`interval`,`country`,`count`) "+
        "SELECT '1',project,'d',country,COUNT(DISTINCT user_id) as count "+
        "FROM classifications "+
        "GROUP BY project,country", function(err, rows, fields) {

        if(err) throw err;

        res.send(rows);


    });

}


function updateAnalyticsIntervals(res,analyticsArray){
    var analytics = analyticsArray.shift();
    var interval = analytics.interval; // hours
    var dataType = analytics.type;
    var seconds = interval*60*60;

    console.log('updateAnalyticsIntervals',analytics.type, analytics.interval);

    /*
    switch (interval) {
        case 'd': // day
            seconds = 60 * 60 * 24;
            break;
        case 'w': // week
            seconds = 60 * 60 * 24 * 7;
            break;
        case 'm': // month
            seconds = 60 * 60 * 24 * 7 * 30;
            break;
    }
    */

    // http://stackoverflow.com/questions/14105018/generating-a-series-of-dates
    // http://stackoverflow.com/questions/75752/what-is-the-most-straightforward-way-to-pad-empty-dates-in-sql-results-on-eithe

 // startTime: beginning of series
 //connection.query("SELECT count(*) AS count,project,FLOOR((UNIX_TIMESTAMP(created_at)-starTime)/"+interval+") AS time "+
 //"FROM classifications WHERE created_at BETWEEN FROM_UNIXTIME("+from+") AND FROM_UNIXTIME("+to+")"+
 //"GROUP BY time,project", function(err, rows, fields) {



    var maxTimeUnix = 0;
    // type, project, interval, country, count
    connection.query("SELECT UNIX_TIMESTAMP(created_at) AS time FROM classifications ORDER BY time DESC LIMIT 1",function(err, rows, fields) {

        if(err) throw err;
        maxTimeUnix = rows[0].time;
        console.log('maxTimeUnix: ', maxTimeUnix);

        var unixTime = maxTimeUnix-seconds;
        console.log('unixTime: ', unixTime);

        var dataQuery = "";

        switch(dataType){
            case "c":
                dataQuery = "COUNT(*) AS count";
                break;
            case "u":
                dataQuery = "COUNT(DISTINCT user_id) as count";
                break;
        }
        var updateTime = (new Date()).valueOf()/1000;

        connection.query("INSERT INTO analytics (`type_id`,`project`,`interval`,`country`,`count`,`updated`)"+
            "SELECT '"+dataType+"',project,'"+interval+"',country,"+dataQuery+",FROM_UNIXTIME("+updateTime+")"+
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


exports.updateTimeSeries = function(req, res) {

    // localhost:5000/updateTimeSeries/from/1348790400/to/1348876800/interval/3600 // sept 2012
    // localhost:5000/updateTimeSeries/from/1362096000/to/1364688000/interval/3600
    // 1362096000 01/03/2013
    // 1364688000 31/03/2013

    var from = parseInt(req.params.from); // unix timestamp
    var to = parseInt(req.params.to); // unix timestamp
    var interval = parseInt(req.params.interval); // secs

    if(isNaN(to) || isNaN(from) || isNaN(interval)){
        res.send([]);
        return;
    }

    var bars={};
    bars[MIN_SECS] = 60, bars[MIN_15_SECS] = 60, bars[HOUR_SECS] = 24, bars[DAY_SECS] = 30;

    from = Math.max(from,to-interval*bars[interval.toString()]);
    var series = [
        {type:'c',interval:interval,from:from,to:to},
        {type:'u',interval:interval,from:from,to:to}
    ];

    console.log('updateTimeSeries',interval,from,to,bars[interval.toString()]);

    updateTimeSeriesIntervals(res,series);

    /* test
     var from = 1348790400; //'2012-09-28'
     var to = 1348876800; //'2012-09-29'


     updateTimeSeriesIntervals(res,[{type:'c',interval:3600,from:from,to:to}]);
     */

}

function updateTimeSeriesIntervals(res,analyticsArray){
    var analytics = analyticsArray.shift();
    var interval = analytics.interval; // seconds
    var dataType = analytics.type;
    var from = analytics.from; // unix timestamp
    var to = analytics.to; // unix timestamp

    console.log('updateTimeSeriesIntervals',analytics.type, analytics.interval);



    var dataQuery = "";
    switch(dataType){
        case "c":
            dataQuery = "COUNT(*) AS count";
            break;
        case "u":
            dataQuery = "COUNT(DISTINCT user_id) as count";
            break;
        default:
            res.send([]);
            return;
    }


    connection.query("SELECT "+dataQuery+",project,FLOOR((UNIX_TIMESTAMP(created_at)-"+from+")/"+interval+") AS time "+
        "FROM classifications WHERE created_at BETWEEN FROM_UNIXTIME("+from+") AND FROM_UNIXTIME("+to+")"+
        "GROUP BY time,project", function(err, rows, fields) {
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
        console.log('unixNow',unixNow);

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

        connection.query("INSERT INTO timeseries (`type_id`,`project`,`interval`,`datetime`,`count`,`updated`) VALUES" +insertStr,
            function (err, rows, fields) {

            if (err) throw err;


            // delete previous data

            var maxTime = 0;
            // find last update time
            connection.query("SELECT UNIX_TIMESTAMP(updated) AS time FROM timeseries ORDER BY updated DESC LIMIT 1",function(err, rows, fields) {

                if(err) throw err;
                maxTime = rows[0].time;
                console.log('maxTime: ', maxTime,'type',dataType,'interval',interval);

                // delete interval records before last update
                var query = "DELETE FROM timeseries WHERE `updated` != FROM_UNIXTIME('"+maxTime+"') AND `type_id`='"+dataType+"' AND `interval`='"+interval+"'";

                console.log(query);
                connection.query(query, function(err, rows, fields) {

                        if(err) throw err;
                        if (analyticsArray.length > 0) {
                            updateTimeSeriesIntervals(res, analyticsArray);
                        }
                        else{
                            res.send(rows);
                        }

                    });
            });



        });

    });

}

/*
function deleteTimeSeriesIntervals(res,type,interval){

    var maxTime = 0;
    // find last update time
    connection.query("SELECT UNIX_TIMESTAMP(updated) AS time FROM timeseries ORDER BY updated DESC LIMIT 1",function(err, rows, fields) {

        if(err) throw err;
        maxTime = rows[0].time;
        console.log('maxTime: ', maxTime,'type',type,'interval',interval);

        // delete interval records before last update
        var query = "DELETE FROM timeseries WHERE `updated` != FROM_UNIXTIME('"+maxTime+"') AND `type_id`='"+type+"' AND `interval`='"+interval+"'";

        console.log(query);
        connection.query(query,function(err, rows, fields) {
            if(err) throw err;
            res.send(rows);

        });
    });

}
*/

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


exports.getTimeSeries = function(req, res) {

    console.log('getTimeSeries');

    connection.query("SELECT `type_id` as type,`interval`,`project`,`datetime` as time,`count` FROM `timeseries`",function(err, rows, fields) {
        if(err) throw err;
        res.send(rows);

    });

}

exports.getTimeSeriesIntervals = function(req, res) {

    console.log('getTimeSeries');
    var intervalsStr = req.params.intervals; // secs
    var intervals = intervalsStr.split(',');


    _.each(intervals,function(interval,index){
        if(!isNaN(interval)){
            intervals[index] = "`interval` = '"+interval+"'";
        }
    });
    var whereStr = " WHERE " + intervals.join(" OR ");
    console.log(whereStr);

    connection.query("SELECT `type_id` as type,`interval`,`project`,`datetime` as time,`count` FROM `timeseries`" + whereStr,function(err, rows, fields) {
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