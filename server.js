var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 3000;
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines"
mongoose.connect(MONGODB_URI);
var app = express();

app.use(logger("dev"));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("public"));

mongoose.Promise = Promise;

app.get("/scrape", function(req, res) {
  axios.get("http://www.theonion.com/").then(function(response) {

    var $ = cheerio.load(response.data);
    $("article h2").each(function(i, element) {
      var result = {};

      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      db.Article
        .create(result)
        .then(function(dbArticle) {

          res.send("Scrape Complete");
        })
        .catch(function(err) {
          res.json(err);
        });
    });
  });
});

app.get("/articles", function(req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.scrapedData.find({}, function(error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      db.articles.find({})
      .then(function(dbArticles){
          res.json(dbArticles)
      })
      .catch(function(err){
          res.json(err);
      })
    }
  });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  db.comments.create(req.body)
        .then(function(dbComment) {
            res.json(dbComment);
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
    });


// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  db.comments.create(req.body)
        .then(function(dbComment) {
            res.json(dbComment);
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
        })
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});