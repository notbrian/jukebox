var spotifyApi = new SpotifyWebApi();
let user
let playlistID
let deviceID

window.onload = function() {
  spotifyApi.setAccessToken(localStorage.getItem("spotifyToken"));
  spotifyApi.getMe().then(function(info) {
    user = info
    if (info) {
      document.querySelector("#login-button").style.display = "none"
      document.querySelector("#signout-button").style.display = "inline-block"

    } else {
      document.querySelector("#login-button").style.display = "inline-block"
      document.querySelector("#signout-button").style.display = "none"
    }

  })

  document.querySelectorAll('.button').forEach((element) => {
    element.addEventListener('click', changeGenre)
  })
  deviceID = localStorage.getItem("deviceID")
}
document.querySelector('#playPause').addEventListener('click', sendOptions)
document.querySelector('#signout-button').addEventListener('click', signOut)
document.querySelector('#date').addEventListener('change', function() {
  localStorage.setItem("changed", "true")
})


function changeGenre(element) {
  localStorage.setItem("genreSelect", element.target.value)
  localStorage.setItem("changed", "true")
}

function signOut() {
  localStorage.setItem('spotifyToken', "");
  location.reload();
}


function sendOptions(e) {
  // spotifyApi.getMyCurrentPlaybackState({}, function(err, res) {
  //   if(res.is_playing && localStorage.getItem("changed") == "false") {
  //     spotifyApi.pause({})
  //   } else if(res.is_playing == false && localStorage.getItem("changed") == "false") {
  //     spotifyApi.play({})
  //   } else {
  let data;
  const genre = localStorage.getItem('genreSelect')
  const date = document.querySelector("#date").value
  data = JSON.stringify([genre, date])

  var request = new XMLHttpRequest();
  request.open('POST', "https://rewindjukebox.herokuapp.com/", true);
  request.setRequestHeader("Content-type", "text/plain");
  request.send(data);

  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      var songData = JSON.parse(request.response);

      var reformattedData = songData.map((element) => {
        if (element.artist.includes("Featuring")) {
          let artist = element.artist.split("Featuring")[0]
          return `${element.title} ${artist}`

        } else {
          return `${element.title} ${element.artist}`
        }
      })

      spotifyApi.createPlaylist(user.id, {
        name: `${date} - ${genre}`
      }).then(function(data) {
        playlistID = data.id
        localStorage.setItem('playlistURI', data.uri)
        console.log(data.uri)


        reformattedData.forEach(function(song) {
          return new Promise((resolve) => {
            spotifyApi.searchTracks(song).then((data) => {
              spotifyApi.addTracksToPlaylist(user.id, playlistID, [data.tracks.items["0"].uri], function(err, data) {})
            })
          })
        })

        Promise.all(reformattedData).then(() => {
          console.log(data.uri, deviceID)
          setTimeout(function() {
            spotifyApi.play({
              context_uri: data.uri,
              device_id: deviceID
            })
          }, 500)

        });



      }).catch(function(err) {
        console.log(err)
      })

    }
  }
  // setTimeout(function() {
  //   console.log(localStorage.getItem('playlistURI'))
  //   console.log('playing playlsoit fam')
  //   spotifyApi.play({context_uri: localStorage.getItem('playlistURI'), device_id: localStorage.getItem('deviceID')})
  //   localStorage.setItem("changed", "false")
  // }, 1500)

}
// })



// }
