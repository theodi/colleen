
//https://www.npmjs.org/package/node-mysql
//https://github.com/felixge/node-mysql

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'colleen',
    password : 'galaxy',
    database: 'zoon'
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
    var count = req.params.count;//mysql.escapeId(req.params.count);
    var offset = req.params.offset;//mysql.escapeId(req.params.count);
    console.log('Retrieving last ' + count + ' classifications, offet: ' + offset);

    connection.query("SELECT * FROM ?? LIMIT "+offset+","+count,['classifications'], function(err, rows, fields) {
    //connection.query('SELECT * FROM ?? LIMIT ?,?',['classifications',offset,count], function(err, rows, fields) {

        if(err) throw err;
        res.send(rows);
    });

};

/*
 

exports.findLastHowmany = function(req, res) {
    var howmany = req.params.howmany;
    console.log('Retrieving last ' + howmany + ' classifications');
    db.collection('classifications', function(err, collection) {
	    collection.find().sort( { timestamp: -1 } ).limit(parseInt(howmany)).toArray(function(err, items) {
            // JSONP
            //res.send(req.query.callback + '('+JSON.stringify(items)+');');

            // JSON
            res.send(items);
		});
	});
};

exports.findSince = function(req, res) {
    var howmany = req.params.howmany;
    var offset = req.params.timeperiod; //  in days
    var d = new Date();
    d.setTime(d.getTime() - (parseInt(offset)*60*60*24*1000));
    var targetdatestring = d.toISOString();

    console.log('Retrieving last ' + howmany + ' classifications since ' + targetdatestring);
    db.collection('classifications', function(err, collection) {
	    collection.find({ timestamp: {$gt: targetdatestring}}).limit(parseInt(howmany)).toArray(function(err, items) {
		    res.send(items);
		    //res.send(targetdatestring);
		});
	});
};


exports.findLast = function(req, res) {
    var howmany = req.params.howmany;
    var offset = req.params.count;
    console.log('Retrieving last ' + howmany + ' classifications, offet: ' + offset);
    db.collection('classifications', function(err, collection) {
        collection.find().sort( { timestamp: -1 } ).limit(parseInt(howmany)).skip(parseInt(offset)).toArray(function(err, items) {
            // JSONP
            //res.send(req.query.callback + '('+JSON.stringify(items)+');');

            // JSON
            res.send(items);
        });
    });
};

exports.findDuration = function(req, res) {
    var max = req.params.max;
    var duration = req.params.duration; //  in seconds
    var offset = req.params.offset; // in seconds
    var offsetMS = offset*1000;

    var maxDateStr = 0;
    db.collection('classifications', function(err, collection) {
        collection.find().sort( { timestamp: -1 } ).limit(1).toArray(function(err, items) {
            //console.log(items);
            maxDateStr = items[0].timestamp;
            //console.log("maxDateStr:" +maxDateStr);

            var maxDate = new Date(maxDateStr);
            var maxDateValue = maxDate.valueOf();

            console.log("max value:" +  maxDate.valueOf());
            console.log("max toISOString:" +  maxDate.toISOString());

            maxDateValue -= offsetMS;
            maxDate = new Date(maxDateValue);
            console.log("max value offset:" +  maxDate.valueOf());
            console.log("max offset toISOString:" +  maxDate.toISOString());


            var minDateValue = maxDateValue-duration*1000;
            var minDate = new Date(minDateValue);
            console.log("min value:" +  minDate.valueOf());
            console.log("min toISOString:" +  minDate.toISOString());

            collection.find({ timestamp: {"$lt": maxDate.toISOString(),"$gt":minDate.toISOString()}}).limit(parseInt(max)).toArray(function(err, items) {
            //collection.find({ timestamp: {"$lt": maxDate,"$gt":minDate}}).limit(parseInt(max)).toArray(function(err, items) {
                // JSONP
                //res.send(req.query.callback + '('+JSON.stringify(items)+');');

                // JSON
                res.send(items);
            });


        });
    });

};

exports.getClassificationCountByProject = function(req, res){
    // command line
    // db.classifications.group({key:{project:1},reduce:function(curr,result){result.total+=1},initial:{total:0}})

    // group by date
    // http://stackoverflow.com/questions/5168904/group-by-dates-in-mongodb

    db.collection('classifications', function(err, collection) {

        collection.group(['project'], {}, {"count":0}, "function (obj, prev) { prev.count++; }", function(err, results) {

            // JSONP
            //res.send(req.query.callback + '('+JSON.stringify(results)+');');
            // JSON
            res.send(results);
        });

    });

};

exports.groupByDate = function(req, res){
    // command line
    // db.classifications.group({key:{project:1},reduce:function(curr,result){result.total+=1},initial:{total:0}})

    // Mongo Node API
    // http://mongodb.github.io/node-mongodb-native/

    // group by date
    // http://stackoverflow.com/questions/5168904/group-by-dates-in-mongodb
    // http://smyl.es/how-to-use-mongodb-date-aggregation-operators-in-node-js-with-mongoose-dayofmonth-dayofyear-dayofweek-etc/
    // http://stackoverflow.com/questions/3428246/executing-mongodb-query-in-node-js
    // Collection.prototype.group = function group(keys, condition, initial, reduce, finalize, command, callback) {

    db.collection('classifications', function(err, collection) {
        collection.group({
            keyf: function(doc) {
                var date = new Date(doc.date);
                var dateKey = (date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear()+'';
                return {'day':dateKey};
            },
            cond: {topic:"abc"},
            initial: {count:0},
            reduce: function(obj, prev) {prev.count++;}
        });
    });

};



// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {
 
    var classifications = [
    {
	location: {city: "", country: "NL", latitude: 52.5, longitude: 5.75},
	project: "condor", 
	subject: "http://www.condorwatch.org/subjects/standard/534c4b87d31eae05430681ef.JPG",
	timestamp: "2014-04-16T15:12:22Z",
	user_id: 274343
    }, 
    {
	location: {city: "", country: "BE", latitude: 50.8333, longitude: 4.0},
	project: "galaxy_zoo",
	subject: "http://www.galaxyzoo.org/subjects/standard/524482bb3ae74054bf004131.jpg", 
	timestamp: "2014-04-16T15:12:21Z",
	user_id: 1682882
    }];

    db.collection('classifications', function(err, collection) {
	    collection.insert(classifications, {safe:true}, function(err, result) {});
    });
 
};
    */