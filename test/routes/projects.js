/**
 * Created by ruben on 7/8/16.
 */
/* eslint-env mocha */
'use strict';
let JsonSchemaAssert = require('../../node_modules/json-schema-assert/index.js');
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
let jsonAssert = new JsonSchemaAssert(projSchema);

describe('Schema Validation for project.js', function () {
  it('should work if the JSON is in the correct format', function () {
    /* let projectsList = {
      title: 'Project Array',
      items: []
    };
    let item = {id: '1337', name: 'Hank'};
    projectsList.items.push(item); // Push the current project
    console.log(JSON.stringify(projectsList));
    */

    before(function (done) {
      jsonAssert.before(done);
    });
    it('does valid assertion', function (done) {
      jsonAssert.isValid({
        title: 'Project Array',
        items: {
          id: '173',
          name: 'Frank'
        }
      },
      projSchema, done);
    });
  });
});

describe('a specific geolocation', function () {
  var jsonAssert = new JsonSchemaAssert('http://json-schema.org/geo');

  before(function (done) {
    jsonAssert.before(done);
  });

  it('conforms the schema', function (done) {
    jsonAssert.isValid(
      {latitude: 54.8587913, longitude: 83.1052262},
      'http://json-schema.org/geo',
      done
    );
  });
});
