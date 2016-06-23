// Mocha test example code
//var chaijq = require('chai-jquery');

var chai = require('chai');
var assert = chai.assert;
var should = chai.should;
var expect = chai.expect;
var chaiHttp = require('chai-http');
var server = require('../app.js');

// http://mherman.org/blog/2015/09/10/testing-node-js-with-mocha-and-chai/
chai.use(chaiHttp);
//chai.use(chaijq);


describe('Index Page', function () {
    it('should contain a property called text', function(done) {
        var ti = 'Jama Software Capstone';

        chai.request(server)
            .get('/')
            .end(function(err, res){
                console.log(res.body);
                expect(res).to.have.property('text');
                done();
            });
    });
});

