/* eslint-env mocha */

let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let proxyquire = require('proxyquire');

chai.use(dirtyChai);

describe('Projectquire module', () => {
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

  describe('getProjectName function', () => {
    it('should return a resolved promise when there exists a project name.', () => {
      projectquire = proxyquire('../../lib/projectquire', {'./pagination': resolvedPromise});
      expect(projectquire.getProjectName(projectId, url)).to.be.fulfilled();
    });
    it('should return a promise with a name when there exists a project', () => {
      data = [{'fields': {'name': 'mocked project name'}}];
      projectquire = proxyquire('../../lib/projectquire', {'./pagination': resolvedPromise});
      projectquire.getProjectName(projectId, url).then(name => {
        expect(name).to.equal('mocked project name');
      });
    });
    it('should return a rejected promise when no project name exists.', () => {
      projectquire = proxyquire('../../lib/projectquire', {'./pagination': rejectedPromise});
      expect(projectquire.getProjectName(projectId, url)).to.be.rejected();
    });
  });

  describe('getProjectItems function', () => {
    it('should return a resolved promise when there exists at least one item.', () => {
      projectquire = proxyquire('../../lib/projectquire', {'./pagination': resolvedPromise});
      expect(projectquire.getProjectItems(projectId, url)).to.be.fulfilled();
    });
    it('should return a promise with a name when there exists at least one item', () => {
      data = [{'id': 10, 'name': 'item name', 'type': 99}];
      projectquire = proxyquire('../../lib/projectquire', {'./pagination': resolvedPromise});
      projectquire.getProjectItems(projectId, url).then(item => {
        expect(item.id).to.equal(10);
        expect(item.name).to.equal('item name');
        expect(item.type).to.equal(99);
      });
    });
    it('should return a rejected promise when no items exist.', () => {
      projectquire = proxyquire('../../lib/projectquire', {'./pagination': rejectedPromise});
      expect(projectquire.getProjectItems(projectId, url)).to.be.rejected();
    });
  });

  describe('getProjectRelationships function', () => {
    it('should return a resolved promise when there exists at least one item relationship.', () => {
      projectquire = proxyquire('../../lib/projectquire', {'./pagination': resolvedPromise});
      expect(projectquire.getProjectRelationships(projectId, url)).to.be.fulfilled();
    });
    it('should return a resolved promise with relationships if there exists at least one item relationship.', () => {
      data = [{'id': 10, 'fromItem': 1, 'toItem': 2, 'type': 99}];
      projectquire = proxyquire('../../lib/projectquire', {'./pagination': resolvedPromise});
      projectquire.getProjectRelationships(projectId, url).then(item => {
        expect(item.id).to.equal(10);
        expect(item.fromItem).to.equal(1);
        expect(item.toItem).to.equal(2);
        expect(item.type).to.equal(99);
      });
    });
    it('should return a rejected promise when no item relationships exist.', () => {
      projectquire = proxyquire('../../lib/projectquire', {'./pagination': rejectedPromise});
      expect(projectquire.getProjectRelationships(projectId, url)).to.be.rejected();
    });
  });
});
