// Mocha test example code
// To use the script, make sure to --> npm install -g mocha
// To run tests, run command 'mocha test' or 'mocha <your script name>'

var chai = require('chai');
var assert = chai.assert;
var should = chai.should;
var expect = chai.expect;
var chaiHttp = require('chai-http');
var server = require('../app.js');

chai.use(chaiHttp);

describe('Index Page', function () {
    it('should contain a property called text', function(done) {

        // This makes a server request to the route location '/'
        chai.request(server)
            .get('/')
            .end(function(err, res){
                expect(res).to.have.property('text');
                done();
            });
    });
});

