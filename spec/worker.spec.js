worker = require ('../workers/worker.js');


describe("Initialisation phase", function() {
    xit("loads projects list from json file specified in config", function() {
	    expect(worker.nconf.get('projects_list')).toEqual('../data/test_projects.json');
            expect(worker.gProjectList).toEqual([ 'galaxy_zoo' ]);
	    expect(worker.nconf.get('WNU_DB_URL')).toEqual('mysql://test:test@localhost/zoon_test');
     });				 
});

describe("Database setup", function() {
    xit("connects to the database", function() {
	    //	    expect(worker.connection['state']).toEqual('disconnected');
	        worker.connect();
	    expect(worker.connection['state']).toEqual('connected');
	    //	    worker.disconnect();
	    //	    expect(worker.connection['state']).toEqual('disconnected');
    });
});

describe("function getProjectUpdatedTime", function() {
    xit("gets the latest update time for a project from the database", function() {
	    expect(worker.getProjectUpdatedTime('milky_way')).toEqual('2014-05-14 00:00:00');
    });
});



describe("function fetchRequest", function() {

    var fromMs = Date.UTC(2014,06,14,0,0,0);
    var toMs = Date.UTC(2014,06,15,0,0,0);


    var connection = worker.connect();

    var testStr = '[{"id":1359724,"created_at":"2014-07-14T23:59:55.000Z","user_id":155701,"project":"serengeti","country":"US","region":null,"city":"Lexington","latitude":42.4428,"longitude":-71.2317},{"id":1357484,"created_at":"2014-07-14T23:59:28.000Z","user_id":155701,"project":"serengeti","country":"US","region":null,"city":"Lexington","latitude":42.4428,"longitude":-71.2317},{"id":1357152,"created_at":"2014-07-14T23:59:21.000Z","user_id":155701,"project":"serengeti","country":"US","region":null,"city":"Lexington","latitude":42.4428,"longitude":-71.2317},{"id":1356993,"created_at":"2014-07-14T23:59:18.000Z","user_id":155701,"project":"serengeti","country":"US","region":null,"city":"Lexington","latitude":42.4428,"longitude":-71.2317},{"id":1355990,"created_at":"2014-07-14T23:59:10.000Z","user_id":155701,"project":"serengeti","country":"US","region":null,"city":"Lexington","latitude":42.4428,"longitude":-71.2317},{"id":1354303,"created_at":"2014-07-14T23:58:46.000Z","user_id":155701,"project":"serengeti","country":"US","region":null,"city":"Lexington","latitude":42.4428,"longitude":-71.2317},{"id":1353621,"created_at":"2014-07-14T23:58:38.000Z","user_id":155701,"project":"serengeti","country":"US","region":null,"city":"Lexington","latitude":42.4428,"longitude":-71.2317},{"id":1352553,"created_at":"2014-07-14T23:58:28.000Z","user_id":155701,"project":"serengeti","country":"US","region":null,"city":"Lexington","latitude":42.4428,"longitude":-71.2317},{"id":1352281,"created_at":"2014-07-14T23:58:20.000Z","user_id":155701,"project":"serengeti","country":"US","region":null,"city":"Lexington","latitude":42.4428,"longitude":-71.2317},{"id":1351128,"created_at":"2014-07-14T23:58:11.000Z","user_id":155701,"project":"serengeti","country":"US","region":null,"city":"Lexington","latitude":42.4428,"longitude":-71.2317}]';

    var requestStr = "";
    beforeEach(function(done) {
        connection.connect(function(err) {
            if(err) {
                console.log('Worker: error when connecting to db:', err);
                throw err;
            }

            //worker.fetchRequest('galaxy_zoo',fromMs,toMs);

                worker.fetchRequest('serengeti',fromMs,toMs);


                setTimeout(function() {
                    var nRecords = 10;
                    var query = "SELECT * FROM classifications LIMIT "+nRecords;
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

        console.log('expect');
        expect(requestStr).toEqual(testStr);

        done();
    });



});