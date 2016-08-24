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
let express = require('express');

chai.use(dirtyChai);
chai.use(chaiHttp);
chai.use(chaiPromise);

let validateReturnFlag;
let app;
let index;
let path;
let resData;
let renderedHtml;
let teamName;
let userLoginMockData = {username: 'invalid', password: 'invalid', teamName: 'invalid', projectId: 1000};

/**
 * This will effectively replace the validate function in the auth module at lib/auth. This stub is used for testing
 * a false return from the validate function. No other functions within the auth module will be referenced when this
 * stub is used. Therefore, no other functions have been stubbed.
 *
 * {validate}:
 *    @returns {boolean} validateReturnFlag is a boolean variable set at the beginning of every test to determine
 *    the return status of the validate function
 */
let authStub = {
  validate: (req) => {
    return validateReturnFlag;
  }
};

/**
 * This will effectively replace the validate and authenticate functions in the auth module at lib/auth.
 * This stub is used for testing a rejected promise from the authenticate function. The validate function is set to
 * return the validateReturnFlag boolean variable which should be set to true in order for authenticate to be called.
 *
 * {validate}:
 *    @returns {boolean} validateReturnFlag is a boolean variable set at the beginning of every test to determine
 *    the return status of the validate function
 *
 *  * {authenticate}:
 *    @returns {Promise} the returned promise is rejected in this stub
 */
let rejectedAuthPromise = {
  validate: (req) => {
    return validateReturnFlag;
  },
  authenticate: (username, password, teamName) => {
    return new Promise((resolve, reject) => {
      process.nextTick(() => {
        reject();
      });
    });
  }
};

/**
 * This will effectively replace the validate and authenticate functions in the auth module at lib/auth.
 * This stub is used for testing a resolved promise from the authenticate function. The validate function is set to
 * return the validateReturnFlag boolean variable which should be set to true in order for authenticate to be called.
 *
 * {validate}:
 *    @returns {boolean} validateReturnFlag is a boolean variable set at the beginning of every test to determine
 *    the return status of the validate function
 *
 *  * {authenticate}:
 *    @returns {Promise} the returned promise is resolved in this stub with an empty payload
 */
let resolvedAuthPromise = {
  validate: (req) => {
    return validateReturnFlag;
  },
  authenticate: (username, password, teamName) => {
    return new Promise((resolve, reject) => {
      process.nextTick(() => {
        resolve([]);
      });
    });
  }
};

/**
 * This will effectively replace the parseProjectList function in the projects module at lib/projects. This stub
 * is used for mocking the return of a parsed payload in the format specified by the projects JSON spec. This stub
 * will return an empty array as the parsed payload.
 *
 * @returns {Object} an empty array as the parsed payload
 */
let parseProjectsStub = () => {
  return [];
};

/**
 * This function sets up the proxies required to test the index route in the event the get request cannot be found
 * in the source file. It sets up the app to proxyquire app.js with the stubbed index. The index stub is set up to
 * proxyquire the index route with a fake index route that is missing the get request source.
 *
 */
function indexNotFoundProxySetup () {
  index = express.Router();
  app = proxyquire('../../app', {
    './routes/index': index
  });
}

/**
 * This function sets up the proxies required to test the index route in the event validate returns false for
 * the given login credentials. It sets up the app to proxyquire app.js with the stubbed index. The index stub
 * is set up to proxyquire the index route with stubbed validate function that returns false via the authStub object
 *
 */
function falseAuthReturnProxySetup () {
  index = proxyquire('../../routes/index', {
    '../lib/auth': authStub
  });
  app = proxyquire('../../app', {
    './routes/index': index
  });
}

/**
 * This function sets up the proxies required to test the index route in the event the authenticate function returns
 * a rejected promise. It sets up the app to proxyquire app.js with the stubbed index. The index stub is set up to
 * proxyquire the index route with a validate stub that returns true, and an authenticate stub that returns a rejected
 * promise.
 *
 */
function rejectedPromiseProxySetup () {
  index = proxyquire('../../routes/index', {
    '../lib/auth': rejectedAuthPromise
  });
  app = proxyquire('../../app', {
    './routes/index': index
  });
}

/**
 * This function sets up the proxies required to test the index route in the event the authenticate function returns
 * a resolved promise. It sets up the app to proxyquire app.js with the stubbed index. The index stub is set up to
 * proxyquire the index route with a validate stub that returns true, and an authenticate stub that returns a resolved
 * promise.
 *
 */
function resolvedPromiseProxySetup () {
  index = proxyquire('../../routes/index', {
    '../lib/auth': resolvedAuthPromise,
    '../lib/projects': parseProjectsStub
  });
  app = proxyquire('../../app', {
    './routes/index': index
  });
}

describe('index route', () => {
  describe('get request', () => {
    it('should fail when index route source is not found', (done) => {
      indexNotFoundProxySetup();
      chai.request(app)
        .get('/')
        .end((err, res) => {
          expect(err).to.not.equal(null);
          expect(err.status).to.equal(404);
          expect(err.message).to.equal('Not Found');
          expect(res).to.not.equal(null);
          expect(res).to.have.property('text');
          expect(res.text).to.contain('<h1>Not Found</h1>').and.to.contain('<h2>404</h2>');
          done();
        });
    });
  });
  describe('post request', function () {
    it('should render the index view with an error that the credentials are invalid when validate is false', () => {
      validateReturnFlag = false;
      falseAuthReturnProxySetup();
      path = join(__dirname, '../../views/index.ejs');
      resData = {title: 'Error: Incorrect credentials, please try again.', teamName: teamName};
      renderedHtml = ejs.compile(read(path, 'utf8'), {filename: path})(resData);
      chai.request(app)
        .post('/')
        .send(userLoginMockData)
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(err).to.not.be(null);
          expect(res).to.have.property('text');
          expect(res.text).to.equal(renderedHtml);
        });
    });
    it('should render the index view with an error when authenticates promise is rejected', (done) => {
      rejectedPromiseProxySetup();
      validateReturnFlag = true;
      path = join(__dirname, '../../views/index.ejs');
      resData = {title: 'Error: Incorrect credentials, please try again.', teamName: teamName};
      renderedHtml = ejs.compile(read(path, 'utf8'), {filename: path})(resData);
      chai.request(app)
        .post('/')
        .send(userLoginMockData)
        .then(() => {
        })
        .catch((err) => {
          expect(err.message).to.equal('Unauthorized');
          expect(err.status).to.equal(401);
          done();
        });
    });
    it('should render the index view with an empty list of projects when authenticates promise is resolved', (done) => {
      resolvedPromiseProxySetup();
      validateReturnFlag = true;
      return chai.request(app)
        .post('/')
        .send(userLoginMockData)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.redirect.to('/graph');
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
    it('should fail when index route source is not found', (done) => {
      indexNotFoundProxySetup();
      chai.request(app)
        .get('/')
        .end((err, res) => {
          expect(err).to.not.equal(null);
          expect(err.status).to.equal(404);
          expect(err.message).to.equal('Not Found');
          expect(res).to.not.equal(null);
          expect(res).to.have.property('text');
          expect(res.text).to.contain('<h1>Not Found</h1>').and.to.contain('<h2>404</h2>');
          done();
        });
    });
  });
});
