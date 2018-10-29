worker = require ('../workers/worker.js');

worker.startScheduler();
worker.startTimeseriesScheduler();


//worker.startFetch();
//worker.updateTimeSeriesFromArchive();
//worker.singleTimeSeriesFromArchive();
//worker.testMySQLError();
