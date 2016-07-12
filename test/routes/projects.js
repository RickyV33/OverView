/* eslint-env mocha */
'use strict';
let chai = require('chai');
let expect = chai.expect;
let chaiHttp = require('chai-http');
// let server = require('../../app.js');

let Ajv = require('ajv');
let projListSchema = require('../../schema/projectList');
chai.use(chaiHttp);

let credentialFixtureCases = [
  [
    // Valid ID Valid Name
    {'id': 1337, 'name': 'Hank'},
    {'id': 456, 'name': 'John'},
    {'id': 673, 'name': 'Frank'}
  ],
  [
    // Valid ID Invalid Name
    {'id': 1337, 'name': 17},
    {'id': 456, 'name': 'John'},
    {'id': 673, 'name': 'Frank'}
  ],
  [
    // Valid ID Missing Name
    {'id': 1337},
    {'id': 456},
    {'id': 673}
  ],
  [
    // Invalid ID Valid Name
    {'id': 'Jimbo', 'name': 'Hank'},
    {'id': 456, 'name': 'John'},
    {'id': 673, 'name': 'Frank'}
  ],
  [
    // Invalid ID Valid Name
    {'id': 'Jimbo', 'name': 17},
    {'id': 456, 'name': 'John'},
    {'id': 673, 'name': 'Frank'}
  ],
  [
    // Invalid ID Missing Name
    {'id': 'Jimbo'},
    {'id': 456},
    {'id': 673}
  ],
  [
    // Missing ID Valid Name
    {'name': 'Hank'},
    {'name': 'John'},
    {'name': 'Frank'}
  ],
  [
    // Missing ID Invalid Name
    {'name': 17},
    {'name': 'John'},
    {'name': 'Frank'}
  ],
  [
    // Missing ID Missing Name
    {},
    {},
    {}
  ]
];

describe('Schema Validation for project.js', function () {
  let ajv = new Ajv();
  let validate = ajv.compile(projListSchema);
  credentialFixtureCases.forEach(function (fixture) {
    let result = validate(fixture);
    if (result === true) {
      it('Should return true when the JSON schema object is VALID\n', function () {
        expect(result).to.be.true();
      });
    } else {
      it('JSON schema object should be INVALID with the credentials\n \tname: ' + fixture[0].name + ' and ID: ' + fixture[0].id + '\n', function () {
        // console.log('\tShould be invalid with name: ' + fixture[0].name + ' and ID: ' + fixture[0].id);
        expect(result).to.not.be.true();
      });
    }
  });
});
