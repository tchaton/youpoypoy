var express = require('express');
var app = express();
var request = require('request');

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/search', function (req, res) {
    console.log(req['query']);
    var query = req['query'];
    console.log(query)
    var params = {
            key: 'AIzaSyB_1YeJqsDK15qzzA8PtNQKYtRMSuYqXao',
            type: 'video',
            maxResults: '12',
            part: 'id,snippet',
            fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle',
            q: query.query
    };
    request({url:'https://www.googleapis.com/youtube/v3/search', qs:params}, function(err, response, body) {
      if(err) { console.log(err); return; }
      res.send(body);
    });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
