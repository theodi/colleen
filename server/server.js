var express = require('express'),
    classifications = require('./routes/classifications');
 
var app = express();

app.configure(function () {
	app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
	app.use(express.bodyParser());
    });

app.get('/classifications/:howmany', classifications.findLastHowmany);
app.get('/classifications/:howmany/offset/:timeperiod', classifications.findSince);
app.get('/classifications/:howmany/offset_count/:count', classifications.findLast);
app.get('/classifications/:max/duration/:duration/offset/:offset', classifications.findDuration);

app.listen(3000);
console.log('Listening on port 3000...');