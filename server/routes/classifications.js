exports.findAll = function(req, res) {
    res.send([{name:'classification1'}, {name:'classification2'}, {name:'classification3'}]);
};
 
exports.findById = function(req, res) {
    res.send({id:req.params.id, name: "The Name", description: "description"});
};

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
 
exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving classification: ' + id);
    db.collection('classifications', function(err, collection) {
	    collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
		    res.send(item);
		});
	});
};

exports.findLastHowmany = function(req, res) {
    var howmany = req.params.howmany;
    console.log('Retrieving last ' + howmany + ' classifications');
    db.collection('classifications', function(err, collection) {
	    collection.find().sort( { timestamp: -1 } ).limit(parseInt(howmany)).toArray(function(err, items) {
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