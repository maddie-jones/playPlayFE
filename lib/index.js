import './styles.scss';
require('dotenv').config();
import MusixMatchService from './services/musixmatch_service';
const mainSection = document.getElementById('main-section');
const dropDownsSection = document.getElementById('dropdowns');
const artistInput = document.getElementById("search-input");
const findSongsBtn = document.getElementById("find-song-btn");
const favoritesBox = document.getElementById('favorites-box');
const favoriteBtn = document.getElementById('favorite-btn');
const songsDiv = document.getElementById('songs');
const container = document.getElementById('container')
const playlistsDropD = document.getElementById('playlists-dropdown');

function cleanGenre(song) {
  let genre = song["primary_genres"]["music_genre_list"][0]
  if (genre === undefined) {
    return "no genre"
  } else {
    return genre["music_genre"].music_genre_name
  }
}

function renderSongs(data) {
  debugger;
  // let tracks = data["message"]["body"].track_list
  for (let index in tracks) {
   let song = tracks[index]["track"]
   var veriGenre = cleanGenre(song)
   const songHTML = `
       <p>Title: ${song.track_name}</p>
       <p>Artist: ${song.artist_name}</p>
       <p>Genre: ${veriGenre}</p>
       <p>Rating: ${song.track_rating}</p>
   `;
   const starHTML = `
    <i class="fas fa-star" id= "fav${index}"></i>`;

   const songDiv = document.createElement('div')
   songDiv.setAttribute('class', 'song');
   songDiv.setAttribute('id', `song-${index}`);
   songDiv.innerHTML = songHTML;
   songsDiv.appendChild(songDiv);
   const starBtn = document.createElement('button')
   starBtn.setAttribute('class', 'favorite');
   starBtn.setAttribute('id', `fav-${index}`);
   starBtn.innerHTML = starHTML;
   starBtn.addEventListener('click',function() {
     addFavorite(index)});
   songDiv.appendChild(starBtn)
  }
  localStorage.setItem('songsHTML', songsDiv.innerHTML);
}

function openFavDropD() {
  const playlistFavDropD = document.getElementById('playlist-favorites-dropdown');
  document.getElementById('playlist-fav-outer').classList.add('show');
  playlistFavDropD.classList.add('show');
  document.getElementById('dropdownMenuButton').attributes['aria-expanded'] = 'true';
}

function closeFavDropD() {
  const playlistFavDropD = document.getElementById('playlist-favorites-dropdown');
  document.getElementById('playlist-fav-outer').classList.remove('show');
  playlistFavDropD.classList.remove('show');
  document.getElementById('dropdownMenuButton').attributes['aria-expanded'] = 'false';
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
    localStorage.setItem('favorites', favoritesBox.innerHTML);
  })
  .catch(err => console.error(err))
}

function removeFavorite(favId) {
  fetch(`https://evening-cliffs-86902.herokuapp.com/api/v1/favorites/${favId}`, {
    method: 'DELETE'
  })
  .then(() => {
    favoritesBox.removeChild(document.getElementById(`favorite-${favId}`));
    localStorage.setItem('favorites', favoritesBox.innerHTML);
  });
}

function toggleUpdateFavForm(favId, favValues) {
  if (document.getElementById('updateFavForm')) {
    mainSection.removeChild(document.getElementById('updateFavForm'));
  } else {
    showUpdateFavForm(favId, favValues);
  }
}

function showUpdateFavForm(favId, favValues) {
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
  document.getElementById('backUpdate').addEventListener('click', toggleUpdateFavForm);
}

function toggleFavBox() {
  if (favoritesBox.classList.contains('not-visible')) {
    favoritesBox.classList.remove('not-visible');
  } else {
    favoritesBox.classList.add('not-visible');
  }
}

function changeFavorites(event) {
  const clickedClass = event.target.classList[0];
  const clickedFavoriteId = event.target.parentElement.id.split("-")[1];
  if (clickedClass === 'updateFav') {
    toggleUpdateFavForm(clickedFavoriteId, event.target.parentElement.dataset);
  } else if (clickedClass === 'removeFav') {
    removeFavorite(clickedFavoriteId);
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
      <p class="fav-name">Name: ${favData.name}</p>
      <p class="fav-artist_name">Artist Name: ${favData.artist_name}</p>
      <p class="fav-genre">Genre: ${favData.genre}</p>
      <p class="fav-rating">Rating: ${favData.rating}</p>
      <button class="updateFav">Update</button>
      <button class="removeFav">Remove</button>
      <button class="addToPlay">Add to playlist</button>
  `;

  favDiv.innerHTML = favHtml;
  favoritesBox.appendChild(favDiv);
}

function populateFavorites(favorites) {
  favorites.forEach((favorite) => {
    makeAndAppendFavDiv(favorite)
  });
  localStorage.setItem('favorites', favoritesBox.innerHTML);
}

function showPlaylistFavSection(playlistName) {
  const playlistFavSection = document.createElement('section');
  playlistFavSection.setAttribute('class', 'playlist-favorites');
  playlistFavSection.innerHTML = `
    <div id="playlist-fav-outer" class="dropdown">
    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      Favorites for Playlists
    </button>
    <div id="playlist-favorites-dropdown" class="dropdown-menu" aria-labelledby="dropdownMenuButton"></div>`;
  dropDownsSection.appendChild(playlistFavSection);
}

function showingFavoritesForPlaylist(id) {
  return document.getElementById(`playlist-favorites-${id}`);
}

function showFavoritesForPlaylist(targetedPlaylist) {
  const playlistFavorites = document.createElement('div');
  playlistFavorites.setAttribute('id', `playlist-favorites-${targetedPlaylist.id}`);

  let html = `<p>Favorites for ${targetedPlaylist.innerText}</p>`;
  const favoriteIds = targetedPlaylist.dataset.favorites.split(",");
  favoriteIds.forEach((id) => {
    const dataset = document.getElementById(`favorite-${id}`).dataset;
    const html = `
      <div class="playlist-favorite">
        <li class="dropdown-item">Name: ${dataset.name}</li>
        <li class="dropdown-item">Artist Name: ${dataset.artist_name}</li>
        <li class="dropdown-item">Genre: ${dataset.genre}</li>
        <li class="dropdown-item">Rating: ${dataset.rating}</li>
      </div>
    `;
    const playFav = document.createElement('div')
    playFav.setAttribute('class', 'playlist-favorite');
    playFav.innerHTML = html;
    playlistFavorites.appendChild(playFav);
    const rmFav = document.createElement('button')
    rmFav.setAttribute('class', 'favorite');
    rmFav.setAttribute('id', `rmFav-${id}`);
    rmFav.innerHTML = "Remove";
    rmFav.addEventListener('click',function() {
      deleteFromPlay(id, targetedPlaylist.id )});
    playlistFavorites.appendChild(rmFav)
  });
  document.getElementById('playlist-favorites-dropdown').appendChild(playlistFavorites);
}

function deleteFromPlay(id, targetedPlaylist_id){
   fetch(`https://evening-cliffs-86902.herokuapp.com/api/v1/playlists/${targetedPlaylist_id}/favorites/${id}`, {
     method: 'delete'
   })
}
function removeFavoritesForPlaylist(targetedPlaylist) {
  document.getElementById('playlist-favorites-dropdown')
    .removeChild(document.getElementById(`playlist-favorites-${targetedPlaylist.id}`))
}

function showFavorites(e) {
  if (event.target.classList[0] === 'playlist-names') {
    if (!document.getElementsByClassName('playlist-favorites')[0]) {
      showPlaylistFavSection(event.target.innerText);
    }
    if (!showingFavoritesForPlaylist(event.target.id)) {
      showFavoritesForPlaylist(event.target);
    }
    if (!event.target.classList.contains('showing-fav')) {
      openFavDropD();
      event.target.classList.add('showing-fav');
    } else {
      removeFavoritesForPlaylist(event.target);
      closeFavDropD();
      event.target.classList.remove('showing-fav');
    }
  }
}

function addListeners() {
  favoriteBtn.addEventListener('click', toggleFavBox);
  favoritesBox.addEventListener('click', changeFavorites);
  playlistsDropD.addEventListener('click', showFavorites);
}

function getFavorites() {
  const favorites = localStorage.getItem('fav');
  if (favorites) {
    favoritesBox.innerHTML = favorites;
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
  const star = document.getElementById(`fav${index}`)
  star.style.color = "#FFFF00";
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
    localStorage.setItem('favorites', favoritesBox.innerHTML);
    favoritesBox.classList.remove('not-visible');
  });
}

findSongsBtn.addEventListener('click', () => {
  (() => {
    return new Promise((resolve, reject) => {
      resolve(MusixMatchService.getSongs(artistInput.value));
    })
  })()
  .then((data) => {
      console.dir(data);
  })
  .catch((error) => {
    console.error(error);
  })
})

function makePlaylistHtml(playlists) {
  return playlists.reduce((html, playlist) => {
    const favoriteIds = playlist.favorites.reduce((ids, favorite) => {
      ids.push(favorite.id);
      return ids
    }, []);
    html += `
    <div class="playlist">
      <p id="${playlist.id}" data-favorites="${favoriteIds.join(",")}" class="playlist-names">${playlist.name}</p>
    </div>`
    return html
  }, "");
}

function getPlaylists() {
  const playlists = localStorage.getItem('playlists');
  if (playlists) {
    playlistsDropD.innerHTML = playlists;
  } else {
    fetch(`https://evening-cliffs-86902.herokuapp.com/api/v1/playlists`)
      .then(data => data.json())
      .then(json => {
        const playlistHtml = makePlaylistHtml(json.playlists);
        localStorage.setItem('playlists', playlistHtml);
        playlistsDropD.innerHTML = playlistHtml;
      })
  }
}

window.addEventListener('load', () => {
  addListeners();
  getFavorites();
  getPlaylists();
});
