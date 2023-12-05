// Imports
import fs from 'fs';
import path from 'path';
import { error } from 'console';
import { createDirectory, copyDirectories } from './lib-files.js';

export function newModule(appPath, module, target, template) {

  console.log('Creating a new module ' + module + ' with template ' + template );
  let templatePath = path.resolve(path.join(appPath, 'assets', template));
  let targetPath = path.resolve(path.join(target, 'mods'));
  targetPath = createDirectory(targetPath);
  
  if (!fs.existsSync(templatePath)) {
    throw error(`Invalid template ${template} (${templatePath}`);
  }
  if (!fs.existsSync(targetPath)) {
    throw error(`Invalid target for ${module} (${targetPath})`);
  }

  targetPath = path.join(targetPath, module);
  console.log(' - creating default module folders and files...');
  console.log(' - source: ' + templatePath);
  console.log(' - target: ' + targetPath);
  createDirectory(targetPath);
  copyDirectories(templatePath, targetPath);
}