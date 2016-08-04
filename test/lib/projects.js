/* eslint-env mocha */
'use strict';

let chai = require('chai');
let expect = chai.expect;
let chaiHttp = require('chai-http');
let dirtyChai = require('dirty-chai');
let proxyquire = require('proxyquire');
let chaiAsPromised = require('chai-as-promised');

let Ajv = require('ajv');
let projectListSchema = require('../../lib/schema/projectList.json');
let projects = require('../../lib/projects');
let mockProjects = require('../routes/mockProjects.json');

chai.use(dirtyChai);
chai.use(chaiHttp);
chai.use(chaiAsPromised);

let ajv = new Ajv();
let validate = ajv.compile(projectListSchema);
let projectId = 1;
let url = 'url';
let data;
let projectquire;

let resolvedPromise = () => {
  return new Promise((resolve, reject) => {
    resolve(data);
  });
};

let rejectedPromise = () => {
  return new Promise((resolve, reject) => {
    reject(data);
  });
};

let projectFixtureCases = [
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

describe('projects.js module', function () {
  describe('Schema Validation', function () {
    projectFixtureCases.forEach(function (fixture) {
      let result = validate(fixture);
      if (result === true) {
        it('should return true when the JSON schema object is VALID\n', function () {
          expect(result).to.be.true();
        });
      } else {
        it('JSON schema object should be INVALID with the credentials\n \tname: ' + fixture[0].name + ' and ID: ' + fixture[0].id + '\n', function () {
          expect(result).to.not.be.true();
        });
      }
    });
  });

  describe('parseProjectsList function', function () {
    // Array 0 is for checking against completely valid JSON
    // Array 1 is for checking against JSON with an invalid entry in the first set
    let filterJSON = [
      [
        {id: 234, name: 'Chatty'},
        {id: 345, name: 'IIBA BABOK'},
        {id: 456, name: 'Integrated System'}
      ], [
        {id: 345, name: 'IIBA BABOK'},
        {id: 456, name: 'Integrated System'}
      ]
    ];

    it('should return a valid JSON with all three projects when all three projects are valid schema format', function () {
      // When all projects have valid ids and names
      let parsed = projects.parseProjectList(mockProjects);
      let result = validate(parsed);
      expect(parsed).to.deep.equal(filterJSON[0]);
      expect(result).to.be.true();
    });

    it('should return a valid JSON with two of three projects when name is null in the first project', function () {
      // When id is valid and name is invalid
      mockProjects[0].fields.name = null;
      let parsed = projects.parseProjectList(mockProjects);
      let result = validate(parsed);
      expect(parsed).to.deep.equal(filterJSON[1]);
      expect(result).to.be.true();
    });

    it('should return a valid JSON with two of three projects when id is null in the first project', function () {
      // When id is invalid and name is valid
      mockProjects[0].id = null;
      mockProjects[0].fields.name = 'Chatty';
      let parsed = projects.parseProjectList(mockProjects);
      let result = validate(parsed);
      expect(parsed).to.deep.equal(filterJSON[1]);
      expect(result).to.be.true();
    });

    it('should return a valid JSON with two of three projects when name and id are null in the first project', function () {
      // When id and name are invalid
      mockProjects[0].id = null;
      mockProjects[0].fields.name = null;
      let parsed = projects.parseProjectList(mockProjects);
      let result = validate(parsed);
      expect(parsed).to.deep.equal(filterJSON[1]);
      expect(result).to.be.true();
    });

    it('should return an empty array of projects when passed a null', function () {
      // When projects are null
      let empty = [];
      let parsed = projects.parseProjectList(null);
      expect(parsed).to.deep.equal(empty);
    });
  });

  describe('getProjectName function', () => {
    it('should return a promise with a name when there exists a project', () => {
      data = [{'fields': {'name': 'mocked project name'}}];
      projectquire = proxyquire('../../lib/projects', {'./pagination': resolvedPromise});
      projectquire.getProjectName(projectId, url).then(name => {
        expect(name).to.equal('mocked project name');
      });
    });
    it('should return a rejected promise when no project name exists.', () => {
      projectquire = proxyquire('../../lib/projects', {'./pagination': rejectedPromise});
      return expect(projectquire.getProjectName(projectId, url)).to.eventually.be.rejected();
    });
  });

  describe('getProjectItems function', () => {
    it('should return a promise with a name when there exists at least one item', () => {
      data = [{'id': 10, 'fields': {'name': 'item name'}, 'type': 99}];
      projectquire = proxyquire('../../lib/projects', {'./pagination': resolvedPromise});
      projectquire.getProjectItems(projectId, url).then(item => {
        expect(item.id).to.equal(10);
        expect(item.name).to.equal('item name');
        expect(item.type).to.equal(99);
      });
    });
    it('should return a rejected promise when no items exist.', () => {
      projectquire = proxyquire('../../lib/projects', {'./pagination': rejectedPromise});
      return expect(projectquire.getProjectItems(projectId, url)).to.eventually.be.rejected();
    });
  });

  describe('getProjectRelationships function', () => {
    it('should return a resolved promise with relationships if there exists at least one item relationship.', () => {
      data = [{'id': 10, 'fromItem': 1, 'toItem': 2, 'type': 99}];
      projectquire = proxyquire('../../lib/projects', {'./pagination': resolvedPromise});
      projectquire.getProjectRelationships(projectId, url).then(item => {
        expect(item.id).to.equal(10);
        expect(item.fromItem).to.equal(1);
        expect(item.toItem).to.equal(2);
        expect(item.type).to.equal(99);
      });
    });
    it('should return a rejected promise when no item relationships exist.', () => {
      projectquire = proxyquire('../../lib/projects', {'./pagination': rejectedPromise});
      return expect(projectquire.getProjectRelationships(projectId, url)).to.eventually.be.rejected();
    });
  });
});
