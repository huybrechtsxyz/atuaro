// Imports
import path from 'path';
import figlet from 'figlet';
import { fileURLToPath } from 'url';
import { Command } from 'commander';
import { readJsonFile } from './lib-files.js';

// Read Package
const cwdPath = process.cwd();
const appPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)) + '/..');
const packageFile = path.resolve(path.join(appPath, './package.json'));
const packageData = await readJsonFile(packageFile);
console.log(figlet.textSync(packageData.title));
console.log('Description: ' + packageData.description);
console.log(' - Work path: ' + cwdPath);
console.log(' - App path: ' + appPath);
console.log('');

// Create command line interface
const program = new Command();
program
  .name(packageData.name)
  .version(packageData.version);

// NEW
const cmdNew = program.command('new');

// NEW - PROJECT
import { newProject } from './new-project.js';
const cmdNewProject = cmdNew.command('project');
cmdNewProject
  .argument('<project>', 'Name of the project')
  .option('-p, --path <target>', 'Path where to create the project', cwdPath)
  .option('-t, --template <template>', 'Selected template to create', 'new-project')
  .description('Creates a new project in the given directory based on a template')
  .action((project, options) => { newProject(appPath, project, options.path, options.template) });

// // NEW - MODULE
import { newModule } from './new-module.js';
const cmdNewModule = cmdNew.command('module');
cmdNewModule
  .argument('<module>', 'Name of the module')
  .option('-p, --path <target>', 'Path of the project', cwdPath)
  .option('-t, --template <template>', 'Selected template to create', 'new-module')
  .description('Creates a new module in the given project based on a template')
  .action((module, options) => { newModule(appPath, module, options.path, options.template) });

// // NEW - STORY
import { newStory } from './new-story.js';
const cmdNewStory = cmdNew.command('story');
cmdNewStory
  .argument('<story>', 'Name of the story')
  .option('-p, --path <target>', 'Path of the project', cwdPath)
  .option('-t, --template <template>', 'Selected template to create', 'new-story')
  .description('Creates a new storty in the given project based on a template')
  .action((story, options) => { newStory(appPath, story, options.path, options.template) });

// // NEW - ITEM
import { newCreature } from './new-item.js';

// // NEW - ITEM - CREATURE
const cmdNewCreature = cmdNew.command('creature');
cmdNewCreature
  .argument('<creature>', 'Name of the creature')
  .requiredOption('-k, --kind <kind>','Selected file to copy')
  .option('-p, --path <target>', 'Path of the project', cwdPath)
  .option('-t, --template <template>', 'Selected template to create', 'creature.yaml')
  .option('-s, --source <source>', 'Selected source from which to copy [fvtt]')
  .option('-c, --copy <copyof>','Selected file to copy')
  .option('-f, --force','Selected file to copy',false)
  .description('Creates a new creature in the given project based on a template and source', '')
  .action((creature, options) => { newCreature(appPath, creature, options) });

// Parse and execute commandline.
program.parse(process.argv)
console.log('');