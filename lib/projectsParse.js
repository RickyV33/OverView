'use strict';

function ProjectArray (title) {
  this.title = title;
  this.items = [ function (id, name) {
    this.id = id;
    this.name = name;
  }];
}

function projectsParse (projData) {
  let projArr = new ProjectArray('Project Array');

  projData.forEach(function (p) {
    let item = {
      id: p.id,
      name: p.fields.name
    };
    projArr.items.push(item); // Push the current project
  });

  return projArr;
}

module.exports = projectsParse;
