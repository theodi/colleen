var mongo = require('mongodb');
 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('classificationdb', server);
 
db.open(function(err, db) {
	if(!err) {
	    console.log("Connected to 'classificationdb' database");
	    db.collection('classifications', {strict:true}, function(err, collection) {
		    if (err) {
			console.log("The 'classifications' collection doesn't exist. Creating it with sample data...");
			populateDB();
		    }
		});
	}
    });
 

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
    var offset = req.params.timeperiod; /*  in days */
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

    /*--------------------------------------------------------------------------------------------------------------------*/
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