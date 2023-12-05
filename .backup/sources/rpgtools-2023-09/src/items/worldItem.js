'use strict';

class worldItem {
  constructor(project = '', name = '') {
    this.project = project;
    this.name = name;
  }

  get key() { return { project: this.project, world: this.name }; };

  project;
  name;
  vtt;
  path;
}

export default worldItem;