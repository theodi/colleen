worker = require ('../workers/worker.js');


describe("Initialisation phase", function() {
    it("loads projects list from json file specified in config", function() {
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