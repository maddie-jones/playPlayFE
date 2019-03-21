import './styles.scss'
require('dotenv').config();
console.log(process.env)
const artistInput = document.getElementById("search-input")
const findSongsBtn = document.getElementById("find-song-btn")
// const apiKey =
var $ = require("jquery");

function showSongs() {
  let artist = artistInput.value
  $.ajax({
      type: "GET",
      data: {
          apikey:`${apiKey}`,
          q_artist: artist,
          format:"jsonp",
          callback:"jsonp_callback"
      },
      url: "https://api.musixmatch.com/ws/1.1/track.search",
      dataType: "jsonp",
      jsonpCallback: 'jsonp_callback',
      contentType: 'application/json',
      success: function(data) {
        renderSongs(data);
      }
    });
}

function genre(song) {
  let genre = song["primary_genres"]["music_genre_list"][0]
  if (genre === undefined) {
    return "no genre"
  } else {
    return genre["music_genre"].music_genre_name
  }
}

function renderSongs(data) {
  let tracks = data["message"]["body"].track_list
  for (var track in tracks) {
   let song = tracks[track]["track"]
   var veriGenre = genre(song)

   var par= document.createElement("P")
   var t = document.createTextNode(`Title: ${song.track_name}`)
   par.appendChild(t)
   document.getElementById("song").appendChild(par);
   var par= document.createElement("P")
   var t = document.createTextNode(`Genre: ${veriGenre}`)
   par.appendChild(t)
   document.getElementById("song").appendChild(par);

   var button= document.createElement("BUTTON")
   var t = document.createTextNode("Favorite")
   button.appendChild(t)
   document.getElementById("song").appendChild(button);
  }
}

findSongsBtn.addEventListener('click', showSongs)
