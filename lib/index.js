import './styles.scss'
require('dotenv').config();
const artistInput = document.getElementById("search-input")
const findSongsBtn = document.getElementById("find-song-btn")
const favoriteBtn = document.getElementById("favorite-drop")
const apiKey ="869c7b19121345facdc061b2aa12dabf"
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
   const element = `
     <div class="song">
       <p>Title: ${song.track_name}</p>
       <p>Genre: ${veriGenre}</p>
       <button type="button" name="button">
        <i class="far fa-star"></i>
       </button>
     </div>
   `;

   const div = document.createElement('div')
   div.innerHTML = element;
   document.getElementById("songs").appendChild(div);
  }
}
function renderFavorites(data){
  console.log(data)
}

function getFavorites() {
  fetch(`https://evening-cliffs-86902.herokuapp.com/api/v1/favorites`)
    .then(response => response.json())
    .then(data => renderFavorites(data))
    .catch((error) => console.error({ error }))
}

function showFavorites() {
  getFavorites()
}


findSongsBtn.addEventListener('click', showSongs)
favoriteBtn.addEventListener('click', showFavorites)
