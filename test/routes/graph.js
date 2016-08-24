/* eslint-env mocha */

'use strict';

let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let chaiHttp = require('chai-http');
let proxyquire = require('proxyquire');

let ejs = require('ejs');
let read = require('fs').readFileSync;
let join = require('path').join;

let projects = require('./../../lib/projects');

let mockProjects = require('./mockProjects.json');
let mockGraph = require('./mockGraph.json');

chai.use(dirtyChai);
chai.use(chaiHttp);

let graphViewTestFixtures = [
  {
    caseTitle: 'should render the graph view with no projects',
    data: {
      title: 'JamaTrace',
      subtitle: 'Graph',
      projects: null
    }
  },
  {
    caseTitle: 'should render the graph view with one project',
    data: {
      title: 'JamaTrace',
      subtitle: 'Graph',
      projects: [ mockProjects[0] ]
    }
  },
  {
    caseTitle: 'should render the graph view with many projects',
    data: {
      title: 'JamaTrace',
      subtitle: 'Graph',
      projects: mockProjects
    }
  }
];

describe('graph', function () {
  describe('GET /graph', function () {
    let graphView = null;
    let errorView = null;
    let app = null;
    let graphRouteStub = null;
    let buildGraphDoesResolve = true;
    let errorFixture = {};
    let sessionMock = {};
    let request = null;

    before(() => {
      let path = join(__dirname, '../../views/graph.ejs');
      graphView = ejs.compile(read(path, 'utf8'), {filename: path});
      path = join(__dirname, '../../views/error.ejs');
      errorView = ejs.compile(read(path, 'utf8'), {filename: path});
      mockProjects = projects.parseProjectList(mockProjects);

      graphRouteStub = proxyquire('./../../routes/graph', {
        './../lib/graph': class GraphStub {
          constructor () {
            this.buildGraph = () => new Promise((resolve, reject) => {
              if (buildGraphDoesResolve) {
                resolve();
              } else {
                reject();
              }
            });
            this.toJson = () => mockGraph;
          }
        }
      });
      let sqliteStub = () => class SqliteStub {
        constructor () { this.foo = 'bar'; }
      };
      app = proxyquire('./../../app', {
        // Use mock session
        'express-session': () => (req, res, next) => {
          req.session = sessionMock;
          next();
        },
        // Don't use real DB connection
        'connect-sqlite3': sqliteStub,
        './routes/graph': graphRouteStub
      });

      request = chai.request(app);
    });

    beforeEach(() => {
      buildGraphDoesResolve = true;
      errorFixture = {
        message: '',
        error: { status: 500 }
      };
      sessionMock = {
        username: 'foo',
        password: 'bar',
        teamName: 'baz'
      };
    });

    graphViewTestFixtures.forEach(fixture => {
      it(fixture.caseTitle, () => {
        sessionMock.projects = fixture.data.projects;

        return request.get('/graph').send()
          .then(res => {
            expect(res).to.have.status(200);
            expect(res).to.have.property('text');

            let renderedGraphView = graphView(fixture.data);

            expect(res.text).to.equal(renderedGraphView);
          })
          .catch(err => {
            throw err;
          });
      });
    });

    it('should respond with a graph JSON payload', () => {
      return request.get('/graph?project=0').send()
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json();

          expect(res).to.have.property('text');
          expect(res.text).to.equal(JSON.stringify(mockGraph));
        })
        .catch(err => {
          throw err;
        });
    });

    it('should respond with an error when buildGraph rejects', () => {
      buildGraphDoesResolve = false;
      errorFixture.message = 'Could not retrieve graph.';
      errorFixture.error.status = '';

      return request.get('/graph?project=0').send()
        .then(() => {
          expect.fail();
        })
        .catch(err => {
          if (err) {
            let res = err.response;
            expect(res).to.have.status(500);
            expect(res).to.be.html();

            expect(res).to.have.property('text');
            expect(res.text).to.equal(errorView(errorFixture));
          } else {
            expect.fail();
          }
        });
    });

    it('should respond with a 401 authorization failure', () => {
      buildGraphDoesResolve = true;
      errorFixture.message = 'You are unauthorized to perform this operation. Please login.';
      errorFixture.error.status = '401';
      sessionMock = {
        username: false,
        password: false,
        teamName: false
      };

      return request.get('/graph?project=0').send()
        .then(() => {
          expect.fail();
        })
        .catch(err => {
          if (err) {
            let res = err.response;
            expect(res).to.have.status(401);
            expect(res).to.be.html();

            expect(res).to.have.property('text');
            expect(res.text).to.equal(errorView(errorFixture));
          } else {
            expect.fail();
          }
        });
    });
  });
});
