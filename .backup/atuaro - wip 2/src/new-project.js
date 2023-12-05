// Imports
import fs from 'fs';
import path from 'path';
import { error } from 'console';
import { createDirectory, copyDirectories } from './lib-files.js';

export function newProject(appPath, project, target, template) {
  
  console.log('Creating project ' + project + ' with template ' + template );
  let templatePath = path.resolve(path.join(appPath, 'assets', template));
  let targetPath = path.resolve(path.join(target, project));

  if (!fs.existsSync(templatePath)) {
    throw error(`Invalid template ${template} (${templatePath}`);
  }
  if (!fs.existsSync(targetPath)) {
    throw error(`Invalid target for ${project} (${targetPath})`);
  }

  console.log(' - creating default project folders and files...');
  console.log(' - source: ' + templatePath);
  console.log(' - target: ' + targetPath);
  createDirectory(targetPath);
  copyDirectories(templatePath, targetPath);
}