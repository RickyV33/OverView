/* eslint-env mocha */

let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let proxyquire = require('proxyquire');
let tv4 = require('tv4');

let graph = require('../../lib/graph');

chai.use(dirtyChai);

describe('Graph module', function () {
  let spec = {
    '$schema': 'http://json-schema.org/draft-04/schema#',
    'title': 'Graph',
    'type': 'object',
    'properties': {
      'items': {
        'type': 'array',
        'items': {
          'title': 'Item',
          'type': 'object',
          'properties': {
            'id': { 'type': 'integer' },
            'name': { 'type': 'string' },
            'type': { 'type': 'integer' }
          }
        },
        'required': ['id', 'name', 'type']
      },
      'relationships': {
        'type': 'array',
        'items': {
          'title': 'Relationship',
          'type': 'object',
          'properties': {
            'id': { 'type': 'integer' },
            'fromItem': { 'type': 'integer' },
            'toItem': { 'type': 'integer' },
            'type': { 'type': 'integer' }
          }
        },
        'required': ['id', 'fromItem', 'toItem', 'type']
      }
    },
    'required': ['items', 'relationships']
  };

  let mock = {
    'items': [
      {
        'id': 10,
        'name': 'User Login Home Page',
        'type': 99
      },
      {
        'id': 11,
        'name': 'Input a Username',
        'type': 24
      },
      {
        'id': 12,
        'name': 'Input a Password',
        'type': 24
      },
      {
        'id': 13,
        'name': 'Input a TeamName',
        'type': 24
      }
    ],
    'relationships': [
      {
        'id': 1,
        'fromItem': 11,
        'toItem': 10,
        'type': 6 // derived from
      },
      {
        'id': 2,
        'fromItem': 12,
        'toItem': 10,
        'type': 6 // derived from
      },
      {
        'id': 3,
        'fromItem': 13,
        'toItem': 10,
        'type': 6 // derived from
      }
    ]
  };

  let itemAndRelationshipFixtureCases = [
    {
      'items': [ {} ], 'relationships': [ {} ]
    },
    {
      'items': [
        {
          'id': 1,
          'name': 'Item One',
          'type': 10
        }
      ],
      'relationships': [ {} ]
    },
    {
      'items': [ {} ],
      'relationships': [
        {
          'id': 2,
          'fromItem': 1,
          'toItem': 1,
          'type': 20
        }
      ]
    },
    {
      'items': [
        {
          'id': 1,
          'name': 'Item One',
          'type': 10
        }
      ],
      'relationships': [
        {
          'id': 2,
          'fromItem': 1,
          'toItem': 1,
          'type': 20
        }
      ]
    }
  ];

  describe('helper functions', function () {
    let projectId = 1;
    let url = 'url';

    let resolvedProjectNamePromise = function() {
      return new Promise(function (resolve, reject) {
        let projectName = 'project name';
        resolve(projectName);
      })
    };
    let rejectedProjectNamePromise = function () {
      return new Promise(function (resolve, reject) {
        let projectName = '';
        reject(projectName);
      })
    };

    it('should return a resolved promise when there exists a project name.', function () {
      let graph = proxyquire('../../lib/graph', { './getProjectName': resolvedProjectNamePromise });
      expect(graph.getProjectName(projectId, url)).to.be.fulfilled();
    });

    it('should return a rejected promise when no project name exists.', function () {

    });

    it('should return a resolved promise when there exists at least one item.', function () {

    });

    it('should return a rejected promise when no items exist.', function () {

    });

    it('should return a resolved promise when there exists at least one item relationship.', function () {

    });

    it('should return a rejected promise when no item relationships exist.', function () {

    });
  });

  describe('constructor', function () {
    'use strict';

    it('should return a graph with nonempty data members when project ID and url are valid.', function () {
      
    });

    it('should return nothing when either project ID or url are invalid.', function () {

    });
  });
  
  describe('graph Constructor', function () {
    let valid = tv4.valdiate(mock, spec);
  });
});