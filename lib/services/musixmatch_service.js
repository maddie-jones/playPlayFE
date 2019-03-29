const apiKey ="869c7b19121345facdc061b2aa12dabf";
const $ = require("jquery");

export default class MusixMatchService {
  static getSongs(artist) {
    const songs = $.ajax({
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
          return data["message"]["body"].track_list;
        }
      });
    return songs;
  }
}
