/* eslint-env mocha */
'use strict';

function parseProjectList (projects) {
  let projectsList = [];

  projects.forEach(function (p) {
    // id and name are required fields
    if (p.id && p.fields.name) {
      projectsList.push({ id: p.id, name: p.fields.name });
    }
  });

  return projectsList;
}

module.exports = {
  parseProjectList: parseProjectList
};
