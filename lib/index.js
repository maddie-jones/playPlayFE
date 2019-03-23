import './styles.scss'
require('dotenv').config();
const artistInput = document.getElementById("search-input");
const findSongsBtn = document.getElementById("find-song-btn");
const favoriteBtn = document.getElementById("favorite-drop");
const favoritesDropD = document.getElementById('favorites-dropdown');
const songsDiv = document.getElementById('songs')
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

function cleanGenre(song) {
  let genre = song["primary_genres"]["music_genre_list"][0]
  if (genre === undefined) {
    return "no genre"
  } else {
    return genre["music_genre"].music_genre_name
  }
}

function renderSongs(data) {
  let tracks = data["message"]["body"].track_list
  for (let index in tracks) {
   let song = tracks[index]["track"]
   var veriGenre = cleanGenre(song)
   const songHTML = `
       <p>Title: ${song.track_name}</p>
       <p>Genre: ${veriGenre}</p>
       <button type="button" name="button">
        <i class="far fa-star"></i>
       </button>
   `;

   const songDiv = document.createElement('div')
   songDiv.setAttribute('class', 'song');
   songDiv.setAttribute('id', `song-${index}`);
   songDiv.innerHTML = songHTML;
   songsDiv.appendChild(songDiv);
  }
  localStorage.setItem('songsHTML', songsDiv.innerHTML);
}

function changeFavorites(event) {

}

function populateFavorites(favorites) {
  favorites.forEach((favorite, index) => {
    const favDiv = document.createElement('div');
    favDiv.setAttribute('id', `favorite-${favorite.id}`);
    favDiv.setAttribute('class', 'favorite');

    const favHtml = `
      <li>${favorite.name}</li>
      <button class="updateFav">Update</button>
      <button class="removeFav">Remove</button>
    `;

    favDiv.innerHTML = favHtml;
    favoritesDropD.appendChild(favDiv);
  });
  localStorage.setItem('favorites', favoritesDropD.innerHTML);
}

function addListeners() {
  favoritesDropD.addEventListener('click', changeFavorites);
}

function getFavorites() {
  const favorites = localStorage.getItem('favorites');
  if (favorites) {
    favoritesDropD.innerHTML = favorites;
  } else {
    fetch(`http://localhost:3000/api/v1/favorites`)
      .then(response => response.json())
      .then(data => populateFavorites(data))
      .catch((error) => console.error({ error }))
  }
}

findSongsBtn.addEventListener('click', showSongs)

window.addEventListener('load', () => {
  addListeners();
  getFavorites();
});
