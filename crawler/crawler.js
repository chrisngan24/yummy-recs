var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

var BASE_URL = 'http://www.yummly.com/recipe/';
var BASE_SELECTOR = '#sidebar a.y-image'
var OUTPUT_BASE_FILE = 'yummly-recs-%s.json';


var results = [];
var resultsIndex = 0;


var scrapeGlobalResult = function(){
  if (resultsIndex < results.length){
    scrapeURL(results[resultsIndex].id); 
    resultsIndex++;
  }
};

var scrapeURL = function(itemId){
  url = BASE_URL.concat(itemId);
  console.log(url);
  request(url, function(error, response, html){
    if(!error){
      getLinks(html, itemId);  
    }
  });
};


var getLinks = function(html, itemId){
  var $ = cheerio.load(html);
  var recommendations = [];
  $(BASE_SELECTOR).each(function(index, item){
    recommendations.push(getIdFromHref(item.attribs.href));
  });

  var row = {
    id : itemId,
    recommendations : recommendations 
  };
  writeRowToFile(JSON.stringify(row).concat(','));
  scrapeGlobalResult();
};

var writeRowToFile = function(string){
  var file = fs.createWriteStream(getOutputFileName(), {'flags' : 'a'});
  file.write(string);
};

var getIdFromHref = function(href){
  var split = href.split('/');
  return split[split.length-1];
};

var outFile = null;
var getOutputFileName = function(){
  if(!outFile){
    var d = new Date();
    outFile = OUTPUT_BASE_FILE.replace('%s', d.getTime());
  } 
  return outFile; 
};


var loadJson = function(path, callback){

  fs.readFile(path, 'utf8', function(err, data){
    if (err) {
      console.log(err); 
    } else {
      var rows = data.split('\n');
      var i = 0;

      for (var i = 0; i < rows.length; i++){
        var item = rows[i];
        try{
          var parsed = JSON.parse(item); 
          results.push(parsed);
          /*
          setTimeout(function(){
            scrapeURL(parsed.id); 
          }, 100);
          */
        } catch(e){
          console.log('error with row '.concat(i)); 
        }
      }
      scrapeGlobalResult();
/*
      var i = 0;
      var interval = setInterval(function(){
        if (i < results.length) {
          scrapeURL(results[i].id); 
        } else {
          interval = null;   
          writeRowToFile(JSON.stringify(this.data));   
          //  writeRowToFile(']');
        }
        i++;
      }, 900);
      data.forEach(function(item){
        scrapeURL(item.id);
      });
      */
      //scrapeURL(data[0].id);
      //scrapeURL(data[1].id);

      if (callback){
        callback(data);
      }
    }
  });
};


app.listen('8081')

console.log('Magic happens on port 8081');

exports = module.exports = app;

//writeRowToFile('[')


var data = loadJson('../yummly-14-04-22.json');
