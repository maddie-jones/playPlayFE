import './styles.scss'
const artistInput = document.getElementById("search-input")
const findSongsBtn = document.getElementById("find-song-btn")
const apiKey = "869c7b19121345facdc061b2aa12dabf"
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

function renderSongs(data) {
  let tracks = data["message"]["body"].track_list
}

findSongsBtn.addEventListener('click', showSongs)
