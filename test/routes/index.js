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

chai.use(dirtyChai);
chai.use(chaiHttp);
chai.use(chaiPromise);

let validateReturnFlag;
let app;
let index;
let path;
let resData;
let renderedHtml;

let userLoginMockData = {username: 'invalid', password: 'invalid', teamName: 'invalid', projectId: 1000};

let authStub = {
  validate: (req) => {
    return validateReturnFlag;
  }
};

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

let parseProjectsStub = () => {
  return [];
};

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

function indexNotFoundProxySetup () {
  index = require('./mockIndexRoute');
  app = proxyquire('../../app', {
    './routes/index': index
  });
}

function indexFoundProxySetup () {
  index = require('../../routes/index');
  app = require('../../app');
}

function falseAuthReturnProxySetup () {
  index = proxyquire('../../routes/index', {
    '../lib/auth': authStub
  });
  app = proxyquire('../../app', {
    './routes/index': index
  });
}

function rejectedPromiseProxySetup () {
  index = proxyquire('../../routes/index', {
    '../lib/auth': rejectedAuthPromise
  });
  app = proxyquire('../../app', {
    './routes/index': index
  });
}

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
    it('should return a response containing a property called text when index route source is found', (done) => {
      indexFoundProxySetup();
      path = join(__dirname, '../../views/index.ejs');
      resData = {title: 'JamaTrace'};
      renderedHtml = ejs.compile(read(path, 'utf8'), {filename: path})(resData);
      chai.request(app)
        .get('/')
        .then(res => {
          // Render the view using ejs
          expect(res.status).to.equal(200);
          expect(res).to.have.property('text');
          expect(res.text).to.equal(renderedHtml);
          done();
        })
        .catch((err) => {
          throw (err);
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
  describe('post request', function () {
    it('should render the index view with an error that the credentials are invalid when validate is false', () => {
      validateReturnFlag = false;
      falseAuthReturnProxySetup();
      path = join(__dirname, '../../views/index.ejs');
      resData = { title: 'Error: Incorrect credentials, please try again.' };
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
      resData = { title: 'Error: Incorrect credentials, please try again.' };
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
      chai.request(app)
        .post('/')
        .send(userLoginMockData)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.redirect.to('/projects');
          done();
        })
        .catch((err) => {
          throw (err);
        });
    });
  });
});
