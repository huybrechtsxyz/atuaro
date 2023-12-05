'use strict';

class moduleItem {
  constructor(project = '', name = '') {
    this.project = project;
    this.name = name;
  }

  get key() { return { project: this.project, module: this.name }; };

  project;
  name;
  vtt;
  path;
}

export default moduleItem;