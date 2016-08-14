/* eslint-env mocha */
'use strict';

/**
 * Iterate through a list of project items that matches the projectList.json specification. Each item will be parsed
 * into an object of the following format: {id: idNumber, name: 'Project Name'} and then added to the projectsList
 * variable. ProjectsList is initialized to an empty array. If the projects argument is null,
 * the empty projectsList variable is returned. Otherwise, the variable is populated with projects items and then
 * returned.
 *
 * @param {Object} projects a list of projects matching the projectsList.json specification
 * @return {Object} projectsList will either be an empty array if the argument is null
 */
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
