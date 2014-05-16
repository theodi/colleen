
//https://www.npmjs.org/package/node-mysql
//https://github.com/felixge/node-mysql

var _ = require('lodash');

var mysql      = require('mysql');
var DATABASE_URL = process.env.DATABASE_URL;
var connection = mysql.createConnection(DATABASE_URL);

connection.addListener('error', function(connectionException){
	if (connectionException.errno === process.ECONNREFUSED) {
	    console.log('ECONNREFUSED: connection refused to '
            +connection.host
            +':'
		    +connection.port);
	} else {
	    console.log(connectionException);
	}
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

    //    connection.query('SET time_zone = "+00:00"',function(err, rows, fields){
	    //	    console.log(err);
	    //        });


    connection.query("SELECT count(*) AS count,project,FLOOR(UNIX_TIMESTAMP(created_at)/"+interval+") AS time "+
    "FROM classifications WHERE created_at BETWEEN FROM_UNIXTIME("+from+") AND FROM_UNIXTIME("+to+")"+
    "GROUP BY time,project", function(err, rows, fields) {
        if(err) throw err;
        _.map(rows,function(item){
            item.time = parseFloat(item.time)*interval;
            item.date = new Date(item.time*1000).toISOString();
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
                var timeStr = time.toISOString();
                values.push({"label":timeStr,"value":0});
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

        });

        var output = [];

        _.each(projects,function(val,project){
            output.push(projects[project]);
        });
        res.send(output);

    });

};

