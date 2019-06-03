
let games, genres, publishers, searchText;

document.addEventListener('DOMContentLoaded', (event) => {
  updateGames();
  fetchGenres();  
  fetchPublishers();
  autocomplete(document.getElementById("searchInput"), self.games);
});

/**
 * Fetch all genres and set their HTML
 */

fetchGenres = () => {
  DBHelper.fetchGenres((error, genres) => {
    if(error) {
      console.log(error);
    } 
    else {
      self.genres = genres;
      fillGenresHTML();
    }
  })
}

/**
 * Set genres HTML
 */

fillGenresHTML = (genres = self.genres) => {
  const select =  document.getElementById('genres-select');
  genres.forEach(genre => {
    const option = document.createElement('option');
    option.innerHTML = genre;
    option.value = genre;
    select.append(option);
  });
}

/**
 * Fetch all publishers and set their HTML
 */

fetchPublishers = () => {
  DBHelper.fetchPublishers((error, publishers) => {
    if(error) {
      console.log(error);
    } 
    else {
      self.publishers = publishers;
      fillPublishersHTML();
    }
  })
}

/**
 * Set publishers HTML
 */

fillPublishersHTML = (publishers = self.publishers) => {
  const select =  document.getElementById('publishers-select');
  publishers.forEach(publisher => {
    const option = document.createElement('option');
    option.innerHTML = publisher;
    option.value = publisher;
    select.append(option);
  });
}

/**
 * Search Submission and Update
 * In real life scenario, however, we would have to validate it for xss and stuff.
 */
searchGames = () => {
  event.preventDefault();
  self.searchText = document.getElementById('searchInput').value;
  updateGames();
}
/**
 * Update page for current games.
 */

updateGames = () => {
  const gSelect = document.getElementById('genres-select');
  const pSelect = document.getElementById('publishers-select');

  const gIndex = gSelect.selectedIndex;
  const pIndex = pSelect.selectedIndex;

  const genre = gSelect[gIndex].value;
  const publisher = pSelect[pIndex].value;

  const ySort = document.getElementById('year-sort');
  const yIndex = ySort.selectedIndex;
  const year = ySort[yIndex].value;


  DBHelper.fetchGamesByOptions(self.searchText, genre, publisher, (error, games) => {
    if (error) {
      console.error(error);
    } else {
      if(year == 'asc') {
        games.sort((a, b) => parseFloat(a.Year) - parseFloat(b.Year));
      } else if(year == 'des') {
        games.sort((a, b) => parseFloat(b.Year) - parseFloat(a.Year));
      }
      resetGames(games);
      fillGamesHTML();
    }
  })
 }

/**
* Clear current games and their HTML.
*/

resetGames = (games) => {
  self.games = [];
  const ul = document.getElementById('games-list');
  ul.innerHTML = '';
  self.games = games;
}

/**
 * Create all games HTML and add them to the webpage.
 */

fillGamesHTML = (games = self.games) => {
  const ul = document.getElementById('games-list');
  games.forEach(game => {
    ul.append(createGameHTML(game));
  });
}

/**
 * Create game HTML.
 */

createGameHTML = (game) => {
  const li = document.createElement('li');

  const name = document.createElement('h1');
  name.innerHTML = game.Name;
  li.append(name);

  const rank = document.createElement('p');
  rank.innerHTML = `Rank: ${game.Rank}`;
  li.append(rank);

  const genre = document.createElement('p');
  genre.innerHTML = `Genre: ${game.Genre}`;
  li.append(genre);

  const publisher = document.createElement('p');
  publisher.innerHTML = `Publisher: ${game.publisher}`;
  li.append(publisher);

  const year = document.createElement('p');
  year.innerHTML = `Year: ${game.Year}`;
  li.append(year);


  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForGames(game);
  li.append(more);

  return li;
}

/**
 * Autocomplete search
 */

function autocomplete(inp, games) {
  console.log(games);
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < games.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (games[i].Name.substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + games[i].Name.substr(0, val.length) + "</strong>";
          b.innerHTML += games[i].Name.substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + games[i].Name + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
              b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
}
/*execute a function when someone clicks in the document:*/
document.addEventListener("click", function (e) {
    closeAllLists(e.target);
});
}

