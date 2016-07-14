/* eslint-env mocha */

let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let proxyquire = require('proxyquire');

chai.use(dirtyChai);

describe('Projectquire module', () => {
  describe('helper functions', () => {
    let projectId = 1;
    let url = 'url';
    let data;
    let graph;

    let resolvedProjectPromise = () => {
      return new Promise(function (resolve, reject) {
        resolve(data);
      });
    };
    let rejectedProjectPromise = () => {
      return new Promise(function (resolve, reject) {
        reject('Error');
      });
    };

    it('should return a resolved promise when there exists a project name.', () => {
      data = [{'name': 'mocked project name'}];
      graph = proxyquire('../../lib/graph', {'./pagination': resolvedProjectPromise});
      expect(graph.getProjectName(projectId, url)).to.be.fulfilled();
    });

    it('should return a rejected promise when no project name exists.', function () {
      data = [{'name': 'mocked project name'}];
      graph = proxyquire('../../lib/graph', {'./pagination': rejectedProjectPromise});
      expect(getProjectName(projectId, url)).to.be.rejected();
    });

    it('should return a resolved promise when there exists at least one item.', () => {

    });

    it('should return a rejected promise when no items exist.', () => {

    });

    it('should return a resolved promise when there exists at least one item relationship.', () => {

    });

    it('should return a rejected promise when no item relationships exist.', () => {

    });
  });
});