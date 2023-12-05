// Imports
import fs from 'fs';
import path from 'path';
import jpath from 'jsonpath';
import { error } from 'console';
import { createDirectory, readDataFile, writeYamlFile } from './lib-files.js';
import { inspect } from 'util';

/* Parameters for items
 * appPath
 * creature
 * options.kind
 * options.path
 * options.template
 * options.source
 * options.copy
 * options.force
 */

function getTokens(template) {
  var tokens = [];
  template.replace(/\+\+(.+)\+\+/ig, (_, token) => {
    tokens.push(token);
  });
  return tokens;
}

function loopTargetData(targetData,sourceData) {
  console.log(inspect(targetData));
  for (let key in targetData) {
    if (targetData[key]) {
      if (typeof targetData[key] === "object") {
        targetData = loopTargetData(targetData[key],sourceData);
      } else {
        let tokens = getTokens(targetData[key].toString());
        if (!(tokens === undefined) && tokens.length > 0) {
          for(let i in tokens) {
            let sourceExpr = jpath.query(sourceData,tokens[i]); // obj needs to be an object
            let valueExpr = targetData[key].toString().replace(`++${tokens[i]}++`, sourceExpr);
            targetData[key] = valueExpr;
          }
        }
      }
    }
  }
  return targetData;
}

// COPY A CREATURE FROM FOUNDRY
function copyCreatureFVTT(appType, targetFile, creature, options) {
  let sourceData = readDataFile(options.copy);
  let targetData = readDataFile(targetFile);
  return loopTargetData(targetData,sourceData);
}

// COPY A CREATURE
function copyCreature(appType, targetFile, creature, options) {
  switch(options.source) {
    case 'fvtt':
      console.log(` - copying ${appType} from ${options.copy}...`);
      return copyCreatureFVTT(appType, targetFile, creature, options);
    default:
      throw error(`Invalid source type ${options.source} [fvtt]`);
  }
}

// BASIC ACTION TO CREATE A NEW ITEM
function newItem(appPath, appType, item, options) {

  console.log('Creating a new ' + appType + ' ' + item + ' with template ' + options.template );

  // TEMPLATE DIR
  let templatePath = path.resolve(path.join(appPath, 'assets', 'new-item', options.template));
  if (!fs.existsSync(templatePath)) {
    throw error(`Invalid template ${options.template} (${templatePath})`);
  }
  
  // REPO DIR
  let targetPath = createDirectory(path.resolve(path.join(options.path, 'repo')));

  // CREATURE DIR
  targetPath = path.resolve(path.join(targetPath, appType));
  if (!fs.existsSync(targetPath)) {
    if (options.force==false) {
      throw error(`Invalid repo ${appType} for ${targetPath}`);
    }
    createDirectory(targetPath);
  }

  // CREATURE | BEAST DIR
  targetPath = path.resolve(path.join(targetPath, options.kind));
  if (!fs.existsSync(targetPath)) {
    if (options.force==false) {
      throw error(`Invalid repo ${options.kind} for ${targetPath}`);
    }
    createDirectory(targetPath);
  }

  // CHECK SOURCE
  if (options.source) {
    switch(options.source.toLowerCase()) {
      case 'fvtt':
        console.log(` - creating ${appType} with ${options.copy}...`);
        break;
      default:
        throw error(`Invalid source type ${options.source} [fvtt]`);
    }
    if (!fs.existsSync(options.copy)) {
      throw error(`Invalid source ${options.source} for (${options.copy})`);
    }
  }
  else{
    console.log(` - creating default ${appType} file...`);
  }

  targetPath = path.join(targetPath, item + path.extname(templatePath) );
  console.log(' - source  : ' + templatePath);
  console.log(' - target  : ' + targetPath);
  if (!fs.existsSync(targetPath) || (fs.existsSync(targetPath) && options.force == true)) {
    fs.copyFileSync(templatePath, targetPath);
  }
  
  return targetPath;
}

// CREATE A NEW CREATURE
export function newCreature(appPath, creature, options) {
  let targetFile = newItem(appPath, 'creature', creature, options);
  if (options.source != null) {
    let targetData = copyCreature('creature', targetFile, creature, options);
    writeYamlFile(path.dirname(targetFile), path.basename(targetFile), targetData );
  }
}