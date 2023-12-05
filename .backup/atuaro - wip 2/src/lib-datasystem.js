'use strict';

import { Datastore } from 'nedb';









export function loadData() {
  db = new Datastore({ filename: "../data/project.db", autoload: true });

}

/ populate database with default users
function setup() {
  var dbUsers = [];

  db.remove({}, { multi: true }, function(err, numRemoved) {
    for (var i = 0; i < users.length; i++) {
      // loop through all users
      dbUsers.push({ name: users[i] });
    }
    db.insert(dbUsers, function(err, newDocs) {
      // add initial users to the database
    });
  });
}

// create a new users entry
app.post("/new", urlencodedParser, function(request, response) {
  db.insert({ name: request.body.user }, function(err, numReplaced, upsert) {
    response.redirect("/");
  });
});

// removes existing users and creates new entries with just the default users
app.get("/reset", function(request, response) {
  users = defaultUsers.slice();
  setup();
  response.redirect("/");
});

