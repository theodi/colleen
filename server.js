var express = require('express'),
    classifications = require('./routes/classifications');
 
var app = express();

app.use('/', express.static(__dirname +'/client'));

app.configure(function () {
	app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
	app.use(express.bodyParser());
    });

app.get('/classificationCount', classifications.getClassificationCount);
app.get('/classifications/:count/offset/:offset', classifications.getLastClassifications);
app.get('/classifications/from/:from/to/:to/interval/:interval', classifications.getClassificationInterval);
app.get('/classificationCount/latest/:seconds',classifications.getClassificationCountLatest);



app.listen(3000);
console.log('Listening on port 3000...');
