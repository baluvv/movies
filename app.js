const express = require("express");
const app = express();
app.use(express.json());

const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let db = null;

const startDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Sever running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

startDBAndServer();

const convertToCamelCase = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

//Get All Movies Names API
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
    movie_name
    FROM movie;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(moviesArray.map((eachMovie) => convertToCamelCase(eachMovie)));
});

//Insert New movie API

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;

  const { directorId, movieName, leadActor } = movieDetails;

  const insertMovieQuery = `
    INSERT INTO
      movie (director_id, movie_name, lead_actor)
    VALUES (${directorId}, '${movieName}', '${leadActor}');`;

  const dbResponse = await db.run(insertMovieQuery);
  response.send("Movie Successfully Added");
});

//Get Movie With Id  API

const convertMovieDetailsToCamelCase = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
    *
    FROM movie
    WHERE movie_id=${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convertMovieDetailsToCamelCase(movie));
});

//Update Movie Details API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;

  const { directorId, movieName, leadActor } = movieDetails;

  const updateMovieQuery = `
    UPDATE movie
    SET
    director_id= ${directorId},
    movie_name= '${movieName}',
    lead_actor= '${leadActor}'
    WHERE movie_id=${movieId};`;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Delete a Movie API
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
    movie
    WHERE movie_id= ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//Get Directors API

const convertDirectorNamesToCamelCase = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT
    *
    FROM director;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) =>
      convertDirectorNamesToCamelCase(eachDirector)
    )
  );
});

//Get All Movies Of Given Director_Id API

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesQuery = `
    SELECT
    movie_name
    FROM movie
    WHERE director_id=${directorId};`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovieName) => convertToCamelCase(eachMovieName))
  );
});

module.exports = app;
