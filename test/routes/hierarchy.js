/* eslint-env mocha */

'use strict';

let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let chaiPromise = require('chai-as-promised');
let express = require('express');
let request = require('supertest');
let app = express();
let router = express.Router();

chai.use(dirtyChai);
chai.use(chaiPromise);
chai.use(chaiPromise);

function initializeRoute (object) {
  router.get('/hierarchy', function (req, res) {
    res.status(200).send({title: 'Select a root item (Optional)',
      itemHierarchy: [{name: 'oneName', children: [{name: 'childName', children: []}]}]});
  });
}

describe('hierarchy', function () {
  describe('GET /hierarchy', function () {
    initializeRoute({});
    app.use(router);
    request(app)
      .get('/hierarchy')
      .end(function (err, res) {
        if (err) {
          throw (err);
        } else {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.deep.equal({
            "itemHierarchy": [
              {
                "children": [
                  {
                    "children": [],
                    "name": "childName"
                  }
                ],
                "name": "oneName"
              }
            ],
            "title": "Select a root item (Optional)"
          });
        }
      });
  });
});
