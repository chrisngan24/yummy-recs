var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

var BASE_URL = 'http://www.yummly.com/recipe/';
var BASE_SELECTOR = '#sidebar a.y-image'
var OUTPUT_BASE_FILE = 'yummly-recs-%s.json';
var OUTPUT_BASE_FOLDER = './out/yummly-recs-%s';


var results = [];
var resultsIndex = 96951;
var fileCount = 110;
var fileSizeLimit = 4000;


var scrapeGlobalResult = function(){
  try{
    if (resultsIndex < 499999){
      scrapeURL(results[resultsIndex].id); 
      resultsIndex++;
    }
  } catch(error){
    console.log(error);
    scrapeGlobalResult();
  }
};

var scrapeURL = function(itemId){
  url = BASE_URL.concat(itemId);
  console.log(url + ' resultsIndex: ' + resultsIndex.toString());
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
  writeRowToFile(JSON.stringify(row).concat('\n'));
  scrapeGlobalResult();
};

var writeRowToFile = function(string){
  try{
    fs.appendFile(getOutputFileName(), string, {'flags' : 'a'}, function(error){
      if(error){
        console.log('error with' + string);
        console.log(error);
      }
    });
    /*
    fs.createWriteStream(getOutputFileName(), {'flags' : 'a'}, function(error, file){
      if(!error){
        file.write(string);
      } else {
        console.log(error); 
      }
    });
*/
  } catch(error){
    console.log(error);

  }
};

var getIdFromHref = function(href){
  var split = href.split('/');
  return split[split.length-1];
};

var outFolder = null;
var getOutputFileName = function(){

  if(!outFolder){
    var d = new Date();
    outFolder = OUTPUT_BASE_FOLDER.replace('%s', d.getTime());
    fs.mkdir(outFolder);
  } 

  if (resultsIndex % fileSizeLimit == 0){
    fileCount++;
  }

  return outFolder + '/' + OUTPUT_BASE_FILE.replace('%s', fileCount); 
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
        } catch(e){
          console.log('error with row '.concat(i)); 
        }
      }
      scrapeGlobalResult();

      if (callback){
        callback(data);
      }
    }
  });
};


app.listen('8081')

console.log('Magic happens on port 8081');

exports = module.exports = app;



//var data = loadJson('../yummly-14-04-22.json');
var data = loadJson('../yummly-2014-05-04.json');