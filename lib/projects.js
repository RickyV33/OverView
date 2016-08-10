/* eslint-env mocha */

'use strict';

function parseProjectList (projects) {
  let projectsList = [];
  if (projects === null) {
    return projectsList;
  }
  projects.forEach(function (project) {
    // id and name are required fields
    if (typeof project.id === typeof 0 && typeof project.fields.name === typeof 'string') {
      projectsList.push({ id: project.id, name: project.fields.name });
    }
  });

  return projectsList;
}

module.exports = {
  parseProjectList: parseProjectList
};
