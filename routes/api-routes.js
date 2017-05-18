// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Dependencies
// =============================================================

// Requiring our models
var Note = require("../models/Note.js");
var Article = require("../models/Article.js");

// Routes
// =============================================================
module.exports = function(app) {
// A GET request to scrape the echojs website
    app.get("/scrape", function(req, res) {
        // First, we grab the body of the html with request
        console.log(('got to scrape'));
        request("http://www.espn.com/", function(error, response, html) {
            // Then, we load that into cheerio and save it to $ for a shorthand selector
            //console.log("html = ", html);
            var $ = cheerio.load(html);
            // Now, we grab every h2 within an article tag, and do the following:
            $(".headlineStack__list li").each(function(i, element) {

                // Save an empty result object
                var result = {};

                // Add the text and href of every link, and save them as properties of the result object
                result.title = $(this).children("a").text();
                result.link = $(this).children("a").attr("href");

                // Using our Article model, create a new entry
                // This effectively passes the result object to the entry (and the title and link)
                var entry = new Article(result);

                // Now, save that entry to the db
                entry.save(function(err, doc) {
                    // Log any errors
                    if (err) {
                        console.log(err);
                    }
                    // Or log the doc
                    //else {
                    //    console.log(doc);
                   // }
                });

            });
        });
        // Tell the browser that we finished scraping the text
        //res.send("Scrape Complete");
        console.log("Got to redirect");
        res.redirect("/");
    });

// This will get the articles we scraped from the mongoDB
    app.get("/articles", function(req, res) {
        Article.find({}, function(error, doc) {
            // Send any errors to the browser
            if (error) {
                res.send(error);
            }
            // Or send the doc to the browser
            else {
                res.send(doc);
            }
        });
    });

// This will grab an article by it's ObjectId
    app.get("/articles/:id", function(req, res) {

        // Find one article using the req.params.id,
        // and run the populate method with "note",
        // then responds with the article with the note included
        Article.findOne({_id: req.params.id}, function(error, doc){
            if (error) {
                res.send(error);
            }
        })
            .populate("Note")
            .exec(function(error, doc) {
                // Send any errors to the browser
                if (error) {
                    res.send(error);
                }
                // Or, send our results to the browser, which will now include the books stored in the library
                else {
                    res.send(doc);
                }
            });
    });

// Create a new note or replace an existing note
    app.post("/articles/:id", function(req, res) {
        // save the new note that gets posted to the Notes collection
        var newNote = new Note(req.body);
        // then find an article from the req.params.id
        // and update it's "note" property with the _id of the new note
        newNote.save(function(error, doc) {
            // Send any errors to the browser
            if (error) {
                res.send(error);
            }
            // Otherwise
            else {
                // Find our user and push the new note id into the User's notes array
                Article.findOneAndUpdate({_id: req.params.id}, { $push: { "note": doc._id } }, { new: true }, function(err, newdoc) {
                    // Send any errors to the browser
                    if (err) {
                        res.send(err);
                    }
                    // Or send the newdoc to the browser
                    else {
                        res.send(newdoc);
                    }
                });
            }
        });
    });

    /**
     * Drops all articles from Mongo database.
     */
    app.get('/dump-articles', function(req, res) {
        Article.remove({}, function (err) {
            if (err) {
                res.status(500).json({
                    success: false,
                    message: 'Oops, this failed.'
                });
            }
            else {
             //   res.status(200).json({
             //       success: true,
             //       message: 'Articles are no longer with us.'
             //   });
                console.log("Got to redirect after destroy");
                res.redirect("/");
            }
        });
    });
};