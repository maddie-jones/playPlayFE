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
       <p>Artist: ${song.artist_name}</p>
       <p>Genre: ${veriGenre}</p>
       <p>Rating: ${song.track_rating}</p>
       <button type="button" name="button">
        <i class="far fa-star"></i>
       </button>
   `;

   const songDiv = document.createElement('div')
   songDiv.setAttribute('class', 'song');
   songDiv.setAttribute('id', `song-${index}`);
   songDiv.addEventListener('click',function() {
     addFavorite(index)});
   songDiv.innerHTML = songHTML;
   songsDiv.appendChild(songDiv);
  }
  localStorage.setItem('songsHTML', songsDiv.innerHTML);
}

function toggleFavDropD() {
  if (favDropDOuter.classList.contains('show')) {
    favDropDOuter.classList.remove('show');
    favDropDInner.classList.remove('show');
    favDropDBtn.attributes['aria-expanded'] = 'false';
  } else {
    favDropDOuter.classList.add('show');
    favDropDInner.classList.add('show');
    favDropDBtn.attributes['aria-expanded'] = 'true';
  }
}

const capitalizeFirst = (string) => string.charAt(0).toUpperCase() + string.slice(1);

function updateFavorite(e) {
  e.preventDefault();
  const urlEncodedData = [];
  const formData = new FormData(this);
  for (const pair of formData.entries()) {
    urlEncodedData.push(`${encodeURIComponent(pair[0])}=${encodeURIComponent(pair[1])}`);
  }
  fetch(`https://evening-cliffs-86902.herokuapp.com/api/v1/favorites/${this.dataset.favid}`, {
    method: 'PUT',
    body: urlEncodedData.join("&").replace(/%20/g, "+"),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  .then(response => response.json())
  .then(data => {
    mainSection.removeChild(document.getElementById('updateFavForm'));
    const favDiv = document.getElementById(`favorite-${data.favorites.id}`);
    for (const pair of Object.entries(data.favorites)) {
      if (pair[0] === "id") { continue; }
      if (pair[0] === "artist_name") {
        favDiv.getElementsByClassName('fav-artist_name')[0]
          .innerText = `Artist Name: ${pair[1]}`
      } else {
        favDiv.getElementsByClassName(`fav-${pair[0]}`)[0]
          .innerText = `${capitalizeFirst(pair[0])}: ${pair[1]}`;
      }
      favDiv.dataset[pair[0]] = pair[1];
    }
    toggleFavDropD();
    localStorage.setItem('favorites', favDropDInner.innerHTML);
  })
  .catch(err => console.error(err))
}

function removeUpdateFavForm() {
  mainSection.removeChild(document.getElementById('updateFavForm'));
  setTimeout(() => {
    toggleFavDropD();
  }, 1000);
}

function showUpdateFavForm(favId, favValues) {
  console.dir(favValues);
  const formHTML = `
    <label for="name">Name</label>
    <input type="text" name="name" value="${favValues.name}" required>
    <label for="artist">Artist</label>
    <input type="text" name="artist_name" value="${favValues.artist_name}" required>
    <label for="genre">Genre</label>
    <input type="text" name="genre" value="${favValues.genre}" required>
    <label for="rating">Rating</label>
    <input type="text" name="rating" value="${favValues.rating}" required>

    <button id="backUpdate" type="button">Back</button>
    <button type="submit">Update</button>
  `;
  const favForm = document.createElement('form');
  favForm.setAttribute('id', 'updateFavForm');
  favForm.setAttribute('data-favid', favId);
  favForm.innerHTML = formHTML;

  mainSection.insertBefore(favForm, dropDownsSection);
  favForm.addEventListener('submit', updateFavorite);
  document.getElementById('backUpdate').addEventListener('click', removeUpdateFavForm);
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

function makeAndAppendFavDiv(favData) {
  const favDiv = document.createElement('div');
  favDiv.setAttribute('id', `favorite-${favData.id}`);
  favDiv.setAttribute('class', 'favData');
  favDiv.setAttribute('data-name', `${favData.name}`);
  favDiv.setAttribute('data-artist_name', `${favData.artist_name}`);
  favDiv.setAttribute('data-genre', `${favData.genre}`);
  favDiv.setAttribute('data-rating', `${favData.rating}`);

  const favHtml = `
    <li class="fav-name">Name: ${favData.name}</li>
    <li class="fav-artist_name">Artist Name: ${favData.artist_name}</li>
    <li class="fav-genre">Genre: ${favData.genre}</li>
    <li class="fav-rating">Rating: ${favData.rating}</li>
    <button class="updateFav">Update</button>
    <button class="removeFav">Remove</button>
  `;

  favDiv.innerHTML = favHtml;
  favDropDInner.appendChild(favDiv);
}

function populateFavorites(favorites) {
  favorites.forEach((favorite) => {
    makeAndAppendFavDiv(favorite)
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
    fetch(`https://evening-cliffs-86902.herokuapp.com/api/v1/favorites`)
      .then(response => response.json())
      .then(data => populateFavorites(data))
      .catch((error) => console.error({ error }))
  }
}

function addFavorite(index) {
  const childElements = document.getElementById(`song-${index}`).childNodes
  const favName = childElements[1].textContent.slice(7,50)
  const favArtist = childElements[3].textContent.slice(7,50)
  const favGenre = childElements[5].textContent.slice(7,50)
  const favRating = childElements[7].textContent.slice(7,50)
  postFavorite(favName, favArtist, favGenre, favRating);
}

function postFavorite(title, artist, genre, rating) {
  var data = {
    name: title,
    artist_name: artist,
    genre: genre,
    rating: rating,
  }
  fetch(`https://evening-cliffs-86902.herokuapp.com/api/v1/favorites`, {
    method: 'post',
    headers: {
            "Content-Type": "application/json",
        },
    body: JSON.stringify(data),
  })
  .then(data => data.json())
  .then(madeFavorite => {
    makeAndAppendFavDiv({
      id: madeFavorite.favorites.id,
      name: madeFavorite.favorites.name,
      artist_name: madeFavorite.favorites.artist_name,
      genre: madeFavorite.favorites.genre,
      rating: madeFavorite.favorites.rating
    });
    localStorage.setItem('favorites', favDropDInner.innerHTML);
    toggleFavDropD();
  });
}

findSongsBtn.addEventListener('click', showSongs)

window.addEventListener('load', () => {
  addListeners();
  getFavorites();
});
