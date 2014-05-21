
//https://www.npmjs.org/package/node-mysql
//https://github.com/felixge/node-mysql

var _ = require('lodash');

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'colleen',
    password : 'galaxy',
    database: 'zoon',
    timezone: '+00:00'
});

connection.connect(function(err) {

    if(!err){
        console.log('Connected to DB');
    }
    else{
        console.log("Failed to Connect to DB",err.code);
    }
});


exports.getClassificationCount = function(req, res) {
    //connection.query('SELECT COUNT(*) AS count FROM `classifications`', function(err, rows, fields) {
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
    console.log('Retrieving last ' + count + ' classifications, offet: ' + offset);

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

exports.updateAnalytics = function(req, res) {

    connection.query("TRUNCATE `analytics`",function(err) {

        if(err) throw err;

        updateAnalyticsIntervals(res,[{type:'users',interval:'d'},{type:'users',interval:'w'},{type:'users',interval:'m'},
            {type:'cls',interval:'d'},{type:'cls',interval:'w'},{type:'cls',interval:'m'}

        ]);
    });



}


function updateAnalyticsIntervals(res,analyticsArray){
    var analytics = analyticsArray.shift();
    var interval = analytics.interval;
    var dataType = analytics.type;
    var seconds = 0;
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
            case "cls":
                dataQuery = "COUNT(*) AS count";
                dataId = "c";
                break;
            case "users":
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
