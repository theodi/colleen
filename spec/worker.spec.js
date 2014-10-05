worker = require ('../workers/worker.js');
var parseDbURL = require('parse-database-url');
var dbConfig = parseDbURL(worker.nconf.get('WNU_DB_URL'));



describe("function fetchRequest", function() {

    var fromMs = Date.UTC(2014,06,14,0,0,0);
    var toMs = Date.UTC(2014,06,15,0,0,0);


    var connection = worker.connect();

    var testStr = '[{"id":1359724,"created_at":"2014-07-14T23:59:55.000Z","user_id":155701,"project":"serengeti","country":"US","region":null,"city":"Lexington","latitude":42.4428,"longitude":-71.2317},{"id":1357484,"created_at":"2014-07-14T23:59:28.000Z","user_id":155701,"project":"serengeti","country":"US","region":null,"city":"Lexington","latitude":42.4428,"longitude":-71.2317},{"id":1357152,"created_at":"2014-07-14T23:59:21.000Z","user_id":155701,"project":"serengeti","country":"US","region":null,"city":"Lexington","latitude":42.4428,"longitude":-71.2317},{"id":1356993,"created_at":"2014-07-14T23:59:18.000Z","user_id":155701,"project":"serengeti","country":"US","region":null,"city":"Lexington","latitude":42.4428,"longitude":-71.2317},{"id":1355990,"created_at":"2014-07-14T23:59:10.000Z","user_id":155701,"project":"serengeti","country":"US","region":null,"city":"Lexington","latitude":42.4428,"longitude":-71.2317},{"id":1354303,"created_at":"2014-07-14T23:58:46.000Z","user_id":155701,"project":"serengeti","country":"US","region":null,"city":"Lexington","latitude":42.4428,"longitude":-71.2317},{"id":1353621,"created_at":"2014-07-14T23:58:38.000Z","user_id":155701,"project":"serengeti","country":"US","region":null,"city":"Lexington","latitude":42.4428,"longitude":-71.2317},{"id":1352553,"created_at":"2014-07-14T23:58:28.000Z","user_id":155701,"project":"serengeti","country":"US","region":null,"city":"Lexington","latitude":42.4428,"longitude":-71.2317},{"id":1352281,"created_at":"2014-07-14T23:58:20.000Z","user_id":155701,"project":"serengeti","country":"US","region":null,"city":"Lexington","latitude":42.4428,"longitude":-71.2317},{"id":1351128,"created_at":"2014-07-14T23:58:11.000Z","user_id":155701,"project":"serengeti","country":"US","region":null,"city":"Lexington","latitude":42.4428,"longitude":-71.2317}]';

    var requestStr = "";
    beforeEach(function(done) {
	var exec = require('child_process').exec,
	    child;
	// drop and recreate all test tables before running test
	var mysqlLoadCmd = 'mysql -h ' + dbConfig['host'] + ' -u ' + dbConfig['user'] + ' -p' + dbConfig['password'] + ' ' + dbConfig['database'] + ' < data/test_setup.sql';
	console.log('mysqlLoadCmd is ', mysqlLoadCmd);
	child = exec(mysqlLoadCmd,
		     function (error, stdout, stderr) {
			 console.log('stdout: ' + stdout);
			 console.log('stderr: ' + stderr);
			 if (error !== null) {
			     console.log('exec error: ' + error);
			 }
		     });
        connection.connect(function(err) {
            if(err) {
                console.log('Worker: error when connecting to db:', err);
                throw err;
            }

                worker.fetchRequest('serengeti',fromMs,toMs);


                setTimeout(function() {
                    var nRecords = 10;
                    var query = "SELECT id, CONVERT_TZ(`created_at`, @@session.time_zone, '+00:00') as created_at, user_id, project, country, region, city, latitude, longitude FROM classifications WHERE project = 'serengeti' LIMIT "+nRecords;
                    console.log('Classification query:',query);

                    connection.query(query, function(err2, rows, fields) {

                        if(err2) {
                            console.log('Classification query Error');
                            throw err2;
                        }
                        requestStr = JSON.stringify(rows);
                        console.log(requestStr);


                        done();
                    });


                }, 3000);

            });


	});


    it("retrieves data from zoon and insert to classifications table", function(done) {

        expect(requestStr).toEqual(testStr);

        done();
    });



});