import './styles.scss'
require('dotenv').config();
const mainSection = document.getElementById('main-section');
const dropDownsSection = document.getElementById('dropdowns');
const artistInput = document.getElementById("search-input");
const findSongsBtn = document.getElementById("find-song-btn");
const favoriteBtn = document.getElementById("favorite-drop");
const favDropDInner = document.getElementById('fav-dropdown-inner');
const favDropDOuter = document.getElementById('fav-dropdown-outer');
const favDropDBtn = document.getElementById('favorite-drop');
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

function updateFavorite() {
  // fetch(`http://localhost:3000/api/v1/favorites`, {
  //   method: 'POST',
  //
  // })
}

function showUpdateFavForm(favId, favValues) {
  const formHTML = `
    <label for="name">Name</label>
    <input type="text" name="name" value="${favValues.name}">
    <label for="artist">Artist</label>
    <input type="text" name="artist" value="${favValues.artistname}">
    <label for="genre">Genre</label>
    <input type="text" name="genre" value="${favValues.genre}">
    <label for="rating">Rating</label>
    <input type="text" name="rating" value="${favValues.rating}">

    <button id="backUpdate" type="button">Back</button>
    <button type="submit">Update</button>
  `;
  const favForm = document.createElement('form');
  favForm.setAttribute('id', 'updateFavForm');
  favForm.setAttribute('data-favid', favId);
  favForm.innerHTML = formHTML;

  mainSection.insertBefore(favForm, dropDownsSection);
}

function changeFavorites(event) {
  const clickedClass = event.target.classList[0];

  if (clickedClass === 'updateFav') {
    const clickedFavoriteId = event.target.parentElement.id.split("-")[1];
    showUpdateFavForm(clickedFavoriteId, event.target.parentElement.dataset);
  } else if (clickedClass === 'removeFav') {
    // removeFavorite(clickedFavoriteId);
  }
}

function populateFavorites(favorites) {
  favorites.forEach((favorite, index) => {
    const favDiv = document.createElement('div');
    favDiv.setAttribute('id', `favorite-${favorite.id}`);
    favDiv.setAttribute('class', 'favorite');
    favDiv.setAttribute('data-name', `${favorite.name}`);
    favDiv.setAttribute('data-artistname', `${favorite.artist_name}`);
    favDiv.setAttribute('data-genre', `${favorite.genre}`);
    favDiv.setAttribute('data-rating', `${favorite.rating}`);

    const favHtml = `
      <li>Name: ${favorite.name}</li>
      <li>Artist Name: ${favorite.artist_name}</li>
      <li>Genre: ${favorite.genre}</li>
      <li>Rating: ${favorite.rating}</li>
      <button class="updateFav">Update</button>
      <button class="removeFav">Remove</button>
    `;

    favDiv.innerHTML = favHtml;
    favDropDInner.appendChild(favDiv);
  });
  localStorage.setItem('favorites', favDropDInner.innerHTML);
}

function addListeners() {
  favDropDInner.addEventListener('click', changeFavorites);
}

function getFavorites() {
  const favorites = localStorage.getItem('fav');
  if (favorites) {
    favDropDInner.innerHTML = favorites;
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
