
let game;

/**
 * Fill Game Detail Page.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
    fetchGameFromURL();
});

/**
 * Get current game from page URL.
 */

fetchGameFromURL = () => {
    const rank = getParameterByName('rank');
    if (!rank) {
        console.log('No game rank in URL');
    } else {
        DBHelper.fetchGamesByRank(rank, (error, game) => {
        self.game = game;
        if (!game) {
            console.error(error);
            return;
        }
        fillGameHTML();
        });
    }
}

/**
 * Create Game HTML and add it to the webpage
 */

fillGameHTML = (game = self.game) => {

    const name = document.getElementById('game-name');
    name.innerHTML = game.Name;
  
    const platform = document.getElementById('game-platform');
    platform.innerHTML = game.Platform;

    const publisher = document.getElementById('game-publisher');
    publisher.innerHTML = game.Publisher;

    const genre = document.getElementById('game-genre');
    genre.innerHTML = game.Genre;

    const rank = document.getElementById('game-rank');
    rank.innerHTML = game.Rank;

    const year = document.getElementById('game-year');
    year.innerHTML = game.Year;

    const sales = document.getElementById('game-sales');
    sales.innerHTML = game.Global_Sales;

}

/**
 * Get a parameter by name from page URL.
 */

getParameterByName = (name, url) => {
    if (!url)
      url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
      results = regex.exec(url);
    if (!results)
      return null;
    if (!results[2])
      return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
  