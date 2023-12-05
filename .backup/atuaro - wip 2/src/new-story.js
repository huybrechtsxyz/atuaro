// Imports
import fs from 'fs';
import path from 'path';
import { createDirectory, copyDirectories } from './lib-files.js';

export function newStory(appPath, story, target, template) {

  console.log('Creating a new story ' + story + ' with template ' + template );
  let templatePath = path.resolve(path.join(appPath, 'assets', template));
  let targetPath = path.resolve(path.join(target, 'stories'));
  targetPath = createDirectory(targetPath);
  
  if (!fs.existsSync(templatePath)) {
    throw error(`Invalid template ${template} (${templatePath}`);
  }
  if (!fs.existsSync(targetPath)) {
    throw error(`Invalid target for ${story} (${targetPath})`);
  }

  targetPath = path.join(targetPath, story);
  console.log(' - creating default story folders and files...');
  console.log(' - source: ' + templatePath);
  console.log(' - target: ' + targetPath);
  createDirectory(targetPath);
  copyDirectories(templatePath, targetPath);
}