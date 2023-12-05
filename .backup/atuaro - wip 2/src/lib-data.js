// Imports
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import nedb from 'nedb';

export async function find(dataPath, search) {
  var db = new nedb({ filename: dataPath });
  db.findOne({ name: search }, function (err, docs) {
    console.log(docs);
  });
}
