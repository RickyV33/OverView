/* eslint-env mocha */
'use strict';

let chai = require('chai');
let expect = chai.expect;
let chaiHttp = require('chai-http');
// let server = require('../../app.js');

let tv4 = require('tv4');

chai.use(chaiHttp);

let projSchema = {
  '$schema': 'http://json-schema.org/draft-04/schema#',
  'title': 'Project Array',
  'type': 'array',
  'items': {
    'type': 'object',
    'properties': {
      'id': {
        'type': 'integer'
      },
      'name': {'type': 'string'}
    },
    'required': ['id', 'name']
  }
};

describe('Schema Validation for project.js', function () {
  it('JSON schema object is valid', function () {
    let projectsList = {
      title: 'Project Array',
      items: [
        {id: 1337, name: 'Hank'}
      ]
    };
    let projectsListTest = JSON.stringify(projectsList);
    let valid = tv4.validate(projectsListTest, projSchema);
    console.log('Error Code: ' + tv4.error.code);

    expect(valid).to.be.value(0);
  });

  /* it('JSON from rest api data structure is valid', function (done) {
    chai.request(server)
      .get('/projects')
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        done();
      });
  });*/
});
