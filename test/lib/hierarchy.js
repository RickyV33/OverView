/* eslint-env mocha */

'use strict';

let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let proxyquire = require('proxyquire');
let chaiAsPromised = require('chai-as-promised');
let rewire = require('rewire');

chai.use(dirtyChai);
chai.use(chaiAsPromised);

let hierarchy = null;
let mergedChildren = null;
let roots = null;
let data = null;
let username = 'invalidUsername';
let password = 'invalidPassword';
let teamName = 'invalidTeamName';
let projectId = 0;

let rejectedPromise = () => {
  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      reject(data);
    });
  });
};

let resolvedPromise = () => {
  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      resolve(data);
    });
  });
};

let mergeChildrenStub = () => {
  process.nextTick(() => {
    return;
  });
};

let pushChildrenStub = () => {
  process.nextTick(() => {
    return;
  });
};

describe('Hierarchy Module', () => {
  describe('getAllItems function', () => {
    it('should return a rejected promise when the login credentials are invalid', () => {
      projectId = 99;
      data = 'Invalid login credentials';
      hierarchy = proxyquire('../../lib/hierarchy', {'./pagination': rejectedPromise});
      return (expect(hierarchy.getAllItems(username, password, teamName, projectId))
        .to.eventually.be.rejected()).then(item => {
          expect(item).to.equal(data);
        });
    });
    it('should return a rejected promise when the login credentials are valid, but projectId is invalid', () => {
      projectId = 1000;
      data = 'Invalid project ID';
      hierarchy = proxyquire('../../lib/hierarchy', {'./pagination': rejectedPromise});
      return (expect(hierarchy.getAllItems(username, password, teamName, projectId))
        .to.eventually.be.rejected()).then(item => {
          expect(item).to.equal(data);
        });
    });
    it('should return an empty JSON blob when login credentials and projectId are valid', () => {
      projectId = 33;
      data = {};
      hierarchy = proxyquire('../../lib/hierarchy', {'./pagination': resolvedPromise});
      return (expect(hierarchy.getAllItems(username, password, teamName, projectId))
        .to.eventually.be.fulfilled()).then(item => {
          expect(item).to.equal(data);
        });
    });
    it('should return a valid JSON blob with one item and one sub item ' +
      'when login credentials and projectId are valid, and the project contains one item and one sub item', () => {
      projectId = 33;
      data = {'name': 'first item', 'children': {'name': 'sub item of first item', 'children': {}}};
      hierarchy = proxyquire('../../lib/hierarchy', {'./pagination': resolvedPromise});
      return (expect(hierarchy.getAllItems(username, password, teamName, projectId))
        .to.eventually.be.fulfilled()).then(item => {
          expect(item).to.equal(data);
        });
    });
  });
  describe('parseItemHierarchy function', () => {
    describe('parseItemHierarchy function', () => {
      it('should return an empty array when the json blob argument is empty', () => {
        let results;
        data = [];
        hierarchy = rewire('../../lib/hierarchy');
        hierarchy.__set__('mergeChildren', () => mergeChildrenStub());
        hierarchy.__set__('pushChildrenToRoots', () => pushChildrenStub());
        results = hierarchy.parseItemHierarchy(data);
        expect(results).to.deep.equal(data);
        expect(hierarchy.__get__('rootItems')).to.deep.equal(data);
        expect(hierarchy.__get__('children')).to.deep.equal(data);
      });
    });
    it('should return a single item with no children when the json blob argument contains a single root item' +
      'with no children', () => {
      let results;
      data = require('./singleItemHierarchy.json');
      roots = [{'id': 2140, 'type': 24, 'name': 'Input a Username', 'parent': 33, 'children': []}];
      mergedChildren = [];
      hierarchy = rewire('../../lib/hierarchy');
      hierarchy.__set__('mergeChildren', () => mergeChildrenStub());
      hierarchy.__set__('pushChildrenToRoots', () => pushChildrenStub());
      results = hierarchy.parseItemHierarchy(data);
      expect(results).to.deep.equal(roots);
      expect(hierarchy.__get__('rootItems')).to.deep.equal(roots);
      expect(hierarchy.__get__('children')).to.deep.equal(mergedChildren);
    });
    it('should return a root item with one direct child and one nested child when the json ' +
      'blob argument contains a single root item with one child and one nested child', () => {
      let results;
      data = require('./singleItemwithNestedChild.json');
      roots = [{'id': 2104, 'type': 24, 'name': 'Input a Username', 'parent': 33, 'children': [
        {'id': 2119, 'type': 99, 'name': 'User Login Home Page', 'parent': 2104, 'children': []},
        {'id': 2142, 'type': 99, 'name': 'Collect and Display Project Item Hierarchy from Jama',
          'parent': 2104, 'children': []},
        {'id': 2317, 'type': 99, 'name': 'Collect and Display User Projects from Jama',
          'parent': 2104, 'children': [
          {'id': 2143, 'type': 99, 'name': 'Gather User\'s List of Projects', 'parent': 2317, 'children': []}
          ]}
      ]}];
      mergedChildren = [{'id': 2104, 'type': 24, 'name': 'Input a Username', 'parent': 33, 'children': [
        {'id': 2119, 'type': 99, 'name': 'User Login Home Page', 'parent': 2104, 'children': []},
        {'id': 2142, 'type': 99, 'name': 'Collect and Display Project Item Hierarchy from Jama',
          'parent': 2104, 'children': []},
        {'id': 2317, 'type': 99, 'name': 'Collect and Display User Projects from Jama',
          'parent': 2104, 'children': []}
      ]},
        {'id': 2119, 'type': 99, 'name': 'User Login Home Page', 'parent': 2104, 'children': []},
        {'id': 2142, 'type': 99, 'name': 'Collect and Display Project Item Hierarchy from Jama',
          'parent': 2104, 'children': []},
        {'id': 2143, 'type': 99, 'name': 'Gather User\'s List of Projects', 'parent': 2317, 'children': []},
        {'id': 2317, 'type': 99, 'name': 'Collect and Display User Projects from Jama',
          'parent': 2104, 'children': []}];
      hierarchy = rewire('../../lib/hierarchy');
      hierarchy.__set__('mergeChildren', () => {
        hierarchy.__set__('children', mergedChildren);
      });
      hierarchy.__set__('pushChildrenToRoots', () => {
        hierarchy.__set__('rootItems', roots);
      });
      results = hierarchy.parseItemHierarchy(data);
      expect(results).to.deep.equal(roots);
      expect(hierarchy.__get__('rootItems')).to.deep.equal(roots);
      expect(hierarchy.__get__('children')).to.deep.equal(mergedChildren);
    });
    it('should console error message due to an invalid id type for one of the items in the JSON ' +
      'argument blob argument', () => {
      let invalidData = require('./invalidItemHierarchy.json');
      data = require('./invalidItemHierarchy.json');
      hierarchy = rewire('../../lib/hierarchy');
      try {
        hierarchy.parseItemHierarchy(data);
      } catch (err) {
        console.dir(err);
        expect(err).to.equal(invalidData[0]);
      }
    });
  });
  describe('mergeChildren function', () => {
    it('should result in children array being empty as there aren\'t any items in the children array to begin with',
      () => {
        data = [];
        mergedChildren = [];
        hierarchy = rewire('../../lib/hierarchy');
        hierarchy.__set__('children', data);
        hierarchy.mergeChildren();
        expect(hierarchy.__get__('children')).to.deep.equal(mergedChildren);
      });
    it('should result in children array containing the same data from before, since there are no parent items' +
      'in the children array', () => {
      data = [
        {
          'id': 2115,
          'type': 31,
          'name': 'Parent: requirements',
          'parent': 33,
          'children': []
        },
        {
          'id': 2117,
          'type': 35,
          'name': 'Parent: epics',
          'parent': 33,
          'children': []
        }
      ];
      mergedChildren = data;
      hierarchy = rewire('../../lib/hierarchy');
      hierarchy.__set__('children', data);
      hierarchy.mergeChildren();
      expect(hierarchy.__get__('children')).to.deep.equal(mergedChildren);
    });
    it('should result in children array having all children items in the children array into ' +
      'their parents arrya of children', () => {
      data = [{
        'id': 2115,
        'type': 31,
        'name': 'Parent: requirements',
        'parent': 33,
        'children': []
      },
      {
        'id': 2116,
        'type': 34,
        'name': 'child of requirements',
        'parent': 2115,
        'children': []
      },
      {
        'id': 2117,
        'type': 35,
        'name': 'Parent: epics',
        'parent': 33,
        'children': []
      },
      {
        'id': 2118,
        'type': 39,
        'name': 'child of epics',
        'parent': 2117,
        'children': []
      }
      ];
      mergedChildren = [
        {'id': 2115,
          'type': 31,
          'name': 'Parent: requirements',
          'parent': 33,
          'children': [
            {'id': 2116,
              'type': 34,
              'name': 'child of requirements',
              'parent': 2115,
              'children': []}
          ]
        },
        {
          'id': 2116,
          'type': 34,
          'name': 'child of requirements',
          'parent': 2115,
          'children': []
        },
        {
          'id': 2117,
          'type': 35,
          'name': 'Parent: epics',
          'parent': 33,
          'children': [
            {'id': 2118,
              'type': 39,
              'name': 'child of epics',
              'parent': 2117,
              'children': []}
          ]
        },
        {
          'id': 2118,
          'type': 39,
          'name': 'child of epics',
          'parent': 2117,
          'children': []
        }
      ];
      hierarchy = rewire('../../lib/hierarchy');
      hierarchy.__set__('children', data);
      hierarchy.mergeChildren();
      expect(hierarchy.__get__('children')).to.deep.equal(mergedChildren);
    });
  });
  describe('pushChildrenToRoots function', () => {
    it('should result in rootItems array being empty as their aren\'t any items in the roots array to begin with',
      () => {
        data = [];
        roots = [];
        hierarchy = rewire('../../lib/hierarchy');
        hierarchy.__set__('rootItems', roots);
        hierarchy.pushChildrenToRoots();
        expect(hierarchy.__get__('rootItems')).to.deep.equal(data);
      });
    it('should result in rootItems array containing the same data from before, since there are no children items' +
      'in the children array', () => {
      roots = [
        {
          'id': 2115,
          'type': 31,
          'name': 'Parent: requirements',
          'parent': 33,
          'children': []
        },
        {
          'id': 2117,
          'type': 35,
          'name': 'Parent: epics',
          'parent': 33,
          'children': []
        }
      ];
      hierarchy = rewire('../../lib/hierarchy');
      hierarchy.__set__('rootItems', roots);
      hierarchy.pushChildrenToRoots();
      expect(hierarchy.__get__('rootItems')).to.deep.equal(roots);
    });
    it('should result in rootsItem array having all children items in their children array ', () => {
      roots = [
        {
          'id': 2115,
          'type': 31,
          'name': 'Parent: requirements',
          'parent': 33,
          'children': []
        },
        {
          'id': 2117,
          'type': 35,
          'name': 'Parent: epics',
          'parent': 33,
          'children': []
        }
      ];
      data = [{
        'id': 2115,
        'type': 31,
        'name': 'Parent: requirements',
        'parent': 33,
        'children': []
      },
      {
        'id': 2116,
        'type': 34,
        'name': 'child of requirements',
        'parent': 2115,
        'children': []
      },
      {
        'id': 2117,
        'type': 35,
        'name': 'Parent: epics',
        'parent': 33,
        'children': []
      },
      {
        'id': 2118,
        'type': 39,
        'name': 'child of epics',
        'parent': 2117,
        'children': []
      }
      ];
      mergedChildren = [
        {'id': 2115,
          'type': 31,
          'name': 'Parent: requirements',
          'parent': 33,
          'children': [
            {'id': 2116,
              'type': 34,
              'name': 'child of requirements',
              'parent': 2115,
              'children': []}
          ]
        },
        {
          'id': 2117,
          'type': 35,
          'name': 'Parent: epics',
          'parent': 33,
          'children': [
            {'id': 2118,
              'type': 39,
              'name': 'child of epics',
              'parent': 2117,
              'children': []}
          ]
        }
      ];
      hierarchy = rewire('../../lib/hierarchy');
      hierarchy.__set__('rootItems', roots);
      hierarchy.__set__('children', data);
      hierarchy.pushChildrenToRoots();
      expect(hierarchy.__get__('rootItems')).to.deep.equal(mergedChildren);
    });
  });
});
