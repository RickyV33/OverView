/* eslint-env mocha */
'use strict';

function parseProjectList (projects) {
  let projectsList = [];

  projects.forEach(function (p) {
    // id and name are required fields
    if (typeof p.id === typeof 0 && typeof p.fields.name === typeof 'string') {
      projectsList.push({ id: p.id, name: p.fields.name });
    }
  });

  return projectsList;
}

module.exports = {
  parseProjectList: parseProjectList
};
