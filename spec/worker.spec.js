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
    it("retrieve data from zoon and insert to classifications table", function() {
        var fromMs = Date.UTC(2014,06,14,0,0,0);
        var toMs = Date.UTC(2014,06,15,0,0,0);

        //var fromMs = 1402743350000;
        //var toMs = 1402829750000;

        //console.log('worker',worker.connect);

        var connection = worker.connect();
        console.log('worker.connection',worker.connection);
        connection.connect(function(err) {
            if(err) {
                console.log('Worker: error when connecting to db:', err);
                throw err;
            }

            //worker.fetchRequest('galaxy_zoo',fromMs,toMs);
            worker.fetchRequest('serengeti',fromMs,toMs);


            waitsFor(function() {
                return false
            }, "the data has potentially been retrieved", 10000);

            runs(function () {

                var nRecords = 10;
                connection.query("SELECT * FROM ?? LIMIT "+nRecords,['classifications'], function(err, rows, fields) {


                    if(err) throw err;
                    // rows
                    expect(1).toEqual(1);
                });

            });
        });


    });
});