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
let app = require('../../app');

chai.use(dirtyChai);
chai.use(chaiHttp);
chai.use(chaiPromise);

describe('hierarchy', function () {
  let sampleHierarchy = [
    {
      'id': 2104,
      'itemType': 31,
      'name': 'Epics',
      'children': [
        {
          'id': 1111,
          'itemType': 35,
          'name': 'Epic Sub Item',
          'children': [
            {
              'id': 2222,
              'itemType': 36,
              'name': 'Epic Sub Sub Item',
              'children': [
                {
                  'id': 4444,
                  'itemType': 38,
                  'name': 'Epic Third Level Sub Sub Item',
                  'children': []
                }
              ]
            },
            {
              'id': 3333,
              'itemType': 37,
              'name': 'Epic Second Sub Sub Item',
              'children': []
            }
          ]
        }
      ]
    },
    {
      'id': 2115,
      'itemType': 31,
      'name': 'Requirements'
    },
    {
      'id': 2110,
      'itemType': 31,
      'name': 'Stories'
    },
    {
      'id': 2125,
      'itemType': 31,
      'name': 'Test Plans'
    },
    {
      'id': 2123,
      'itemType': 31,
      'name': 'Risks'
    },
    {
      'id': 2124,
      'itemType': 31,
      'name': 'Bugs'
    },
    {
      'id': 2104,
      'itemType': 31,
      'name': 'Epics'
    },
    {
      'id': 2855,
      'itemType': 31,
      'name': 'Stories TEST'
    }
  ];
  describe('get request', function () {
    // This makes a server request to the route location '/hierarchy'
    chai.request(app)
      .get('/hierarchy')
      .end(function (err, res) {
        if (err) {
          expect.fail();
        }
        expect(err).to.be.null();
        it('should contain a property called text', function (done) {
          expect(res).to.have.property('text');
          done();
        });
        it('should have status 200', function (done) {
          expect(res).to.have.status(200);
          done();
        });
        it('should render view with title and unordered list', function (done) {
          // Render the view using ejs
          let path = join(__dirname, '../../views/hierarchy.ejs');
          let data = {title: 'Select a Root Item (Optional) ',
            itemHierarchy: sampleHierarchy};
          let renderedView = ejs.compile(read(path, 'utf8'), {filename: path})(data);
          expect(res.text).to.equal(renderedView);
          expect(res.text).contains('Select a Root Item (Optional) ');
          expect(res.text).contains('Please select a root item from below, and click "Render Graph": ');
          done();
        });
      });
  });
});
