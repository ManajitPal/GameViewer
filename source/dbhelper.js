

class DBHelper {
    
    /**
     * CSV URL to interact with the csv file.
     */

    static get FILE_URL() {
        const port = 8000;
        return `http://localhost:${port}/data/vgsales55c93b8.csv`;
    }

    /**
     * Fetch the CSV file
     */

     static fetchFile(callback) {
        fetch(DBHelper.FILE_URL)
        .then(
            (response) => {
                if (response.status !== 200) {
                    let responseText = `Looks like there was a problem. Status Code: ${response.status}`;
                    callback(responseText, null);
                }
                response.blob().then(function(data) {
                    callback(null, data);
                });
                
            }
        )
        .catch((err) => {
            let errorText = `Fetch Error : ${err}`;
            callback(errorText, null);
        });
    }

    /**
     * Reading the content of CSV file.
     */

    static readFile(callback) {
        DBHelper.fetchFile((error, data) => {
            if(error) {
                callback(error, null);
            }
            else {
                let reader = new FileReader();
                reader.readAsText(data);
                reader.onload = (event) => {
                    let csv = event.target.result;
                    let results = DBHelper.convertToJson(csv);
                    callback(null, results);
                }
                reader.onerror = (event) => {
                    if(event.target.error.name == "NotReadableError") {
                        callback(`File cannot be read`, null);
                    }
                }
            }
        });
    }

    /**
     * Getting Local Storage Data
     */

    static getLocalStorage(callback) {

        if(localStorage.getItem("games") == null) {
            DBHelper.storeLocalStorage((error, result) => {
                if(error) {
                    callback(error, null);
                }
                 else {
                    console.log(result);
                    let games = JSON.parse(localStorage.getItem("games") || "[]");
                    callback(null, games);
                 }
            })
        }
        let games = JSON.parse(localStorage.getItem("games") || "[]");
        callback(null, games);
    }

    /**
     * Storing Data To Local Storage
     */

    static storeLocalStorage(callback) {
        DBHelper.readFile((error, result) => {
            if(error) {
              callback(error, null)
            }
            else {
                localStorage.setItem("games", JSON.stringify(result));
                callback(null, 'GamesStored');
            }
        });

    }

    /**
     * Fetch all games
     */

    static fetchGames(callback) {
        DBHelper.getLocalStorage((error, games) => {
            if(error) {
                callback(error, null);
            }
            else {
                callback(null, games);
            }
        })
    }

    /**
     * Fetch games by rank
     */

    static fetchGamesByRank(rank, callback) {
        DBHelper.fetchGames((error, games) => {
            if(error) {
                callback(error, null);
            }
            else {
                const game = games.find(r => r.Rank == rank);
                if(game) {
                    callback(null, game);
                }
                else {
                    callback(`Game does not exist`, null);
                }
            }
        })
    }

    /**
     * Fetch games by a genre
     */

    static fetchGamesByGenre(genre, callback) {
        DBHelper.fetchGames((error, games) => {
            if(error) {
                callback(error, null);
            }
            else {
                const results = games.find(r => r.Genre == genre);
                callback(null, results);
            }
        })
    }


    /**
     * Fetch games by a publisher
     */

    static fetchGamesByPublisher(publisher, callback) {
        DBHelper.fetchGames((error, games) => {
            if(error) {
                callback(error, null);
            }
            else {
                const results = games.find(r => r.Publisher == publisher);
                callback(null, results);
            }
        })
    }


    /**
     * Fetch games by a publisher and genre
     */

    static fetchGamesByOptions(name, genre, publisher, callback) {
        // Fetch all games
        DBHelper.fetchGames((error, games) => {
            if (error) {
            callback(error, null);
            } else {
            let results = games;
            if (genre != 'all') { // filter by genre
                results = results.filter(r => r.Genre == genre);
            }
            if (publisher != 'all') { // filter by publisher
                results = results.filter(r => r.Publisher == publisher);
            }
            if (name != undefined) { // filter by name
                results = results.filter(r => r.Name.toLowerCase().indexOf(name.toLowerCase()) != -1);
                console.log(name);
            }
            callback(null, results);
            }
        });
    }

    /**
     * Fetch all publishers.
     */

    static fetchPublishers(callback) {
        // Fetch all games
        DBHelper.fetchGames((error, games) => {
            if (error) {
            callback(error, null);
            } else {
            // Get all publishers from all games
            const publishers = games.map((v, i) => games[i].Publisher)
            // Remove duplicates from publishers
            const uniquePublishers = publishers.filter((v, i) => publishers.indexOf(v) == i)
            callback(null, uniquePublishers);
            }
        });
    }


    /**
     * Fetch all genres.
     */

    static fetchGenres(callback) {
        // Fetch all games
        DBHelper.fetchGames((error, games) => {
            if (error) {
            callback(error, null);
            } else {
            // Get all genres from all games
            const genres = games.map((v, i) => games[i].Genre)
            // Remove duplicates from genres
            const uniqueGenres = genres.filter((v, i) => genres.indexOf(v) == i)
            callback(null, uniqueGenres);
            }
        });
    }
    
    /**
     * URL for games
     */
    static urlForGames(game) {
        return (`./game.html?rank=${game.Rank}`);
    }

    /**
     * Converting CSV contents to JSON
     */

    static convertToJson(csv) {
        var lines=csv.split("\n");
        var result = [];
        var headers = lines[0].split(",");
      
        for(var i=1; i<lines.length; i++) {
          var obj = {};
      
          var row = lines[i],
            queryIdx = 0,
            startValueIdx = 0,
            idx = 0;
      
          if (row.trim() === '') { continue; }
      
          while (idx < row.length) {
            /* if we meet a double quote we skip until the next one */
            var c = row[idx];
      
            if (c === '"') {
              do { c = row[++idx]; } while (c !== '"' && idx < row.length - 1);
            }
      
            if (c === ',' || /* handle end of line with no comma */ idx === row.length - 1) {
              /* we've got a value */
              var value = row.substr(startValueIdx, idx - startValueIdx).trim();
      
              /* skip first double quote */
              if (value[0] === '"') { value = value.substr(1); }
              /* skip last comma */
              if (value[value.length - 1] === ',') { value = value.substr(0, value.length - 1); }
              /* skip last double quote */
              if (value[value.length - 1] === '"') { value = value.substr(0, value.length - 1); }
      
              var key = headers[queryIdx++];
              obj[key] = value;
              startValueIdx = idx + 1;
            }
      
            ++idx;
          }
      
          result.push(obj);
        }
        return result;

    }

}