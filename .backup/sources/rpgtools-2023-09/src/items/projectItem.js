'use strict';

class projectItem {
  constructor(project = '', folder = '') {
    this.name = project;
    this.path = folder;
  }

  get key() { return this.name; }
  
  name;
  path;
}

export default projectItem;