/* eslint-env mocha */
'use strict';
let chai = require('chai');
let expect = chai.expect;
let chaiHttp = require('chai-http');
// let server = require('../../app.js');

let Ajv = require('ajv');
let projListSchema = require('../../schema/projectList');
let proj = require('../../lib/projects');
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
let ajv = new Ajv();
let validate = ajv.compile(projListSchema);

describe('Schema Validation for project.js', function () {
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

// This is an example JSON pulled from JAMA used for the tests below
let rawJSON =
 [ { id: 234,
 projectKey: 'Chatty',
 isFolder: false,
 createdDate: '2016-07-01T00:48:06.000+0000',
 modifiedDate: '2016-07-01T00:48:38.000+0000',
 createdBy: 6,
 modifiedBy: 6,
 fields:
 { projectKey: 'Chatty',
 statusId: 298,
 text1: '',
 name: 'Chatty',
 description: '',
 projectGroup: 296 },
 type: 'projects' },
 { id: 345,
 projectKey: 'BABK',
 parent: 30,
 isFolder: false,
 createdDate: '2015-06-02T10:01:00.000+0000',
 modifiedDate: '2015-08-21T09:07:54.000+0000',
 createdBy: 5,
 modifiedBy: 5,
 fields:
 { projectKey: 'BABK',
 statusId: 298,
 text1: '',
 name: 'IIBA BABOK',
 description: 'Configuration based on:\nBABOK® v3\nA GUIDE TO THE BUSINESS ANALYSIS BODY OF KNOWLEDGE® published 2015.\nInternational Institute of Business Analysis, Toronto, Ontario, Canada.',
 projectGroup: 296 },
 type: 'projects' },
 { id: 456,
 projectKey: 'SYS_2',
 parent: 30,
 isFolder: false,
 createdDate: '2015-05-20T11:40:06.000+0000',
 modifiedDate: '2015-12-10T10:59:57.000+0000',
 createdBy: 5,
 modifiedBy: 5,
 fields:
 { projectKey: 'SYS_2',
 statusId: 298,
 text1: '',
 name: 'Integrated System',
 description: '',
 projectGroup: 296 },
 type: 'projects' }];

describe('Validation for parseProjectsList in lib/project.js', function () {
  // Array 0 is for checking against completely valid JSON
  // Array 1 is for checking against JSON with an invalid entry in the first set
  let filterJSON = [
    [
      {id: 234, name: 'Chatty'},
      {id: 345, name: 'IIBA BABOK'},
      {id: 456, name: 'Integrated System'}
    ],
    [
      {id: 345, name: 'IIBA BABOK'},
      {id: 456, name: 'Integrated System'}
    ]
  ];

  it('Should return a valid JSON with all three projects', function () {
    // When all projects have valid ids and names
    let parsed = proj.parseProjectList(rawJSON);
    let result = validate(parsed);
    expect(parsed).to.deep.equal(filterJSON[0]);
    expect(result).to.be.true();
  });

  it('Should return a valid JSON with two of three projects when name is null in the first project', function () {
    // When id is valid and name is invalid
    rawJSON[0].fields.name = null;
    let parsed = proj.parseProjectList(rawJSON);
    let result = validate(parsed);
    expect(parsed).to.deep.equal(filterJSON[1]);
    expect(result).to.be.true();
  });

  it('Should return a valid JSON with two of three projects when id is null in the first project', function () {
    // When id is invalid and name is valid
    rawJSON[0].id = null;
    rawJSON[0].fields.name = 'Chatty';
    let parsed = proj.parseProjectList(rawJSON);
    let result = validate(parsed);
    expect(parsed).to.deep.equal(filterJSON[1]);
    expect(result).to.be.true();
  });

  it('Should return a valid JSON with two of three projects when name and id are null in the first project', function () {
    // When id and name are invalid
    rawJSON[0].id = null;
    rawJSON[0].fields.name = null;
    let parsed = proj.parseProjectList(rawJSON);
    let result = validate(parsed);
    expect(parsed).to.deep.equal(filterJSON[1]);
    expect(result).to.be.true();
  });
});
