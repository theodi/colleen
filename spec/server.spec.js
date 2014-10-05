server = require ('../server.js');
request = require('supertest');

describe('GET /analytics', function(){
    it('should respond with json', function(done){
	request(server.app)
	    .get('/analytics')
	    .set('Accept', 'application/json; charset=utf-8')
	    .expect('Content-Type', 'application/json; charset=utf-8')
	    .expect(200, done);
     });
});

describe('GET /timeseries/intervals/1', function(){
    it('should respond with json', function(done){
	request(server.app)
	    .get('/timeseries/intervals/1')
	    .set('Accept', 'application/json; charset=utf-8')
	    .expect('Content-Type', 'application/json; charset=utf-8')
	    .expect(200, done);
     });
});


describe('GET /timeseries/from/1362096000/to/1364774400', function(){
    it('should respond with json', function(done){
	request(server.app)
	    .get('/timeseries/from/1362096000/to/1364774400')
	    .set('Accept', 'application/json; charset=utf-8')
	    .expect('Content-Type', 'application/json; charset=utf-8')
	    .expect(200, done);
     });
});


describe('GET /classifications/from/1362096000/to/1364774400/interval/1', function(){
    it('should respond with json', function(done){
	request(server.app)
	    .get('/classifications/from/1362096000/to/1364774400/interval/1')
	    .set('Accept', 'application/json; charset=utf-8')
	    .expect('Content-Type', 'application/json; charset=utf-8')
	    .expect(200, done);
     });
});
