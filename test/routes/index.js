/* eslint-env mocha */

'use strict';

let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let chaiHttp = require('chai-http');
let chaiPromise = require('chai-as-promised');
let ejs = require('ejs');
let read = require('fs').readFileSync;
let join = require('path').join;
let proxyquire = require('proxyquire');
var express = require('express');
var supertest = require('supertest');
var sinon = require('sinon');




let authStub = () => {
  let validate = () => {
    console.log('authStub')
  };
};

let projectsStub = () => {
  console.log('projects Stub');
};

let app = proxyquire('../../app',
  {
    'auth': authStub,
    'projects': projectsStub
  });



//let app = require('../../app');
//app.use('/', index);

chai.use(dirtyChai);
chai.use(chaiHttp);
chai.use(chaiPromise);

describe('index route', function () {
  let credentialFixtureCases = [
    {
      username: '',
      password: '',
      teamName: ''
    },
    {
      username: 'dummy',
      password: '',
      teamName: ''
    },
    {
      username: '',
      password: 'wrong',
      teamName: ''
    },
    {
      username: '',
      password: '',
      teamName: 'dummy'
    },
    {
      username: 'dummy',
      password: 'password',
      teamName: ''
    },
    {
      username: '',
      password: 'password',
      teamName: 'sevensource'
    },
    {
      username: 'dummy',
      password: '',
      teamName: 'sevensource'
    },
    {
      username: 'dummy',
      password: 'password',
      teamName: 'sevensource'
    }
  ];

  describe.skip('get request', function () {
    it('should contain a property called text', function (done) {
      // This makes a server request to the route location '/'
      chai.request(app)
        .get('/')
        .end(function (err, res) {
          if (err) {
            expect.fail();
          }
          // Render the view using ejs
          let path = join(__dirname, '../../views/index.ejs');
          let data = {title: 'JamaTrace'};
          let rendHtml = ejs.compile(read(path, 'utf8'), {filename: path})(data);

          // Response rendered html
          let respHtml = res.text;

          expect(res).to.have.property('text');
          expect(err).to.be.null();
          expect(respHtml).to.be.equal(rendHtml);
          done();
        });
    });
  });

  describe('post request', function () {
    chai.request(app)
      .post('/')
      .field('req.body.password', 'invalid')
      .field('username', 'invalid')
      .field('teamName', 'invalid')
      .end(function (err, res) {
        expect(err).to.be(null);
        expect(res).to.have.status(200);
      });



    /*    authStub = () => {
     let validate = (req) => {

     };
     // Authenticate Stub
     let authenticate = (username, password, teamName) => {
     let url = 'http://' + username + ':' + password + '@' + teamName + '.jamacloud.com/rest/latest/projects';
     console.log('authenticate stub hit');
     };
     };*/
    /*  let authStub = sinon.stub();
     app = express();
     let index = proxyquire('../../routes/index', {
     'auth': authStub,
     });

     index(app);*/


    // request = supertest(app);
    /*
     let response = (object) => {
     // console.log('validate stub hit');
     return (object.body.username !== '' && object.body.username.length <= 200 &&
     object.body.password.length >= 6 && object.body.password.length <= 200 &&
     teamName !== '');
     };*/
    //  validate.returns(response);

    /*    authStub.return('blobl');
     credentialFixtureCases.forEach(function (fixture) {
     if (fixture.username && fixture.password && fixture.teamName) {
     it('should return true when all form fields are valid', function () {

     return chai.request(index)
     .post('/index')
     .send({ username: fixture.username, password: fixture.password, teamName: fixture.teamName }).then(res => {
     expect(res.body).to.deep.equal(response);
     //expect(res).to.redirect();
     }).catch(err => { throw err; });
     });
     } else {
     it('should return false when any form field is invalid username is, "' + fixture.username + '" password is, "' +
     fixture.password + '" team name is, "' + fixture.teamName + '".', function () {
     return chai.request(index)
     .post('/')
     .send({ username: fixture.username, password: fixture.password, teamName: fixture.teamName }).then(res => {
     expect(res).to.have.status(200);
     }).catch(err => { throw err; });
     });
     }
     });
     });*/
  });
});
