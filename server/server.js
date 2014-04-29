var express = require('express'),
    classifications = require('./routes/classifications');
 
var app = express();

app.configure(function () {
	app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
	app.use(express.bodyParser());
    });

app.get('/classifications', classifications.findAll);
app.get('/classifications/:id', classifications.findById);
app.post('/classifications', classifications.addClassification);
app.put('/classifications/:id', classifications.updateClassification);
app.delete('/classifications/:id', classifications.deleteClassification);

app.listen(3000);
console.log('Listening on port 3000...');