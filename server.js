const express = require('express')
const app = express()
var bodyParser = require('body-parser')
var billboard = require("billboard-top-100").getChart;


app.use(express.static(__dirname + '/public'));
app.get('/implicit', function(req,res){
 res.sendfile(__dirname + '/public/implicit.html');
});

app.get('/authorize', function(req,res){
 res.sendfile(__dirname + '/public/authorize.html');
});

app.use(bodyParser.text())


app.post("/", function (req, res) {
  const requested = JSON.parse(req.body)
  console.log(requested)
  billboard(requested[0], requested[1], function(songs, err){
    if (err) console.log(err);
    var songArray = []

    for (rank = 0; rank <= 9; rank++) {

      var song = {
        billboardRank: rank + 1,
        title: songs[rank].title,
        artist: songs[rank].artist
      }


      songArray.push(song)
    }
    res.header("Access-Control-Allow-Origin", "*");
    res.send(JSON.stringify(songArray))
  });


})

app.listen(process.env.PORT || 3000, () => console.log('Jukebox app listening on port 3000!'))
