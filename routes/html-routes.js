// *********************************************************************************
// html-routes.js - this file offers a set of routes for sending users to the various html pages
// *********************************************************************************

// Dependencies
// =============================================================
var path = require("path");
// Requiring our models
var Note = require("../models/Note.js");
var Article = require("../models/Article.js");

// Routes
// =============================================================
module.exports = function(app) {

  // Each of the below routes just handles the HTML page that the user gets sent to.

  // index route loads view.html
  app.get("/", function(req, res) {
      // GET route for getting all of the articles
          Article.find({}).then(function(dbArticles) {
              var hbsObject = {
                  articles: dbArticles
              };
              res.render("index", hbsObject);
          });
  });
};