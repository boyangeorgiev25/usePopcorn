import React, { useState, useEffect } from "react";
import StarRating from "./components/StarRating";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "b624d095";

// Main App component
export default function App() {
  const [watched, setWatched] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function closeMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((prev) => {
      const exists = prev.some((m) => m.imdbID === movie.imdbID);
      if (exists) {
        return prev.map((m) => (m.imdbID === movie.imdbID ? movie : m));
      } else {
        return [...prev, movie];
      }
    });
  }

  useEffect(
    function () {
      async function fetchMovies() {
        try {
          setLoading(true);
          setError("");

          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`
          );
          if (!res.ok) {
            throw new Error("Network response was not ok");
          }

          const data = await res.json();
          if (data.Response === "False") {
            throw new Error("Movie not found");
          }

          if (!data.Search) {
            throw new Error("Movie not found");
          }

          setMovies(
            data.Search.filter(
              (movie) =>
                movie.Poster &&
                movie.Poster !== "N/A" &&
                movie.Poster.startsWith("http") &&
                !movie.Poster.includes("noposter.jpg")
            )
          );
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setError("");
        setLoading(false);
        return;
      }

      fetchMovies();
    },
    [query]
  );

  return (
    <div className="container">
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumOfMovies movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {loading && <Loader />}
          {error && <ErrorMessage message={error} />}
          {!loading && !error && (
            <MovieBox onClick={handleSelectMovie} movies={movies} />
          )}
        </Box>

        <Box>
          {selectedId ? (
            <SelectedMovie
              onWatched={handleAddWatched}
              onCloce={closeMovie}
              selectedId={selectedId}
            />
          ) : (
            <>
              <Summary watched={watched} />
              <WatchedBox watched={watched} />
            </>
          )}
        </Box>
      </Main>
    </div>
  );
}

function Loader() {
  return (
    <div className="loader">
      <p className="loader__text">Loading...</p>
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <div className="error">
      <p className="error__text">{message}</p>
      <span>:(</span>
    </div>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumOfMovies({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function MovieBox({ movies, onClick }) {
  const [isOpen1, setIsOpen1] = useState(true);
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen1((open) => !open)}
      >
        {isOpen1 ? "–" : "+"}
      </button>
      {isOpen1 && <MovieList onClick={onClick} movies={movies} />}
    </div>
  );
}

function MovieList({ movies, onClick }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <li key={movie.imdbID}>
          <div onClick={() => onClick(movie.imdbID)}>
            <img src={movie.Poster} alt={`${movie.Title} poster`} />
            <h3>{movie.Title}</h3>
            <div>
              <p>
                <span>🗓</span>
                <span>{movie.Year}</span>
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function SelectedMovie({ onWatched, onCloce, selectedId }) {
  const [movie, setMovie] = useState({});
  const [userRating, setUserRating] = useState();

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  useEffect(
    function () {
      async function getMovieDetails() {
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await res.json();
        setMovie(data);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  function handleAddWached() {
    const newMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };
    onWatched(newMovie);
  }

  return (
    <div className="details">
      <header>
        <button className="btn-back" onClick={onCloce}>
          &larr;
        </button>
        <img
          src={movie.Poster}
          alt={`${movie.Title} poster`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = "none";
          }}
        />
        <div className="details-overview">
          <h2>{title}</h2>
          <p>
            {released} &bull; {runtime}
          </p>
          <p>{genre}</p>
          <p>{imdbRating} IMDb Rating</p>
        </div>
      </header>

      <section>
        <StarRating onSetRating={setUserRating} max={10} />
        {userRating > 0 && (
          <button
            onClick={() => {
              handleAddWached();
              onCloce();
            }}
            className="btn-add"
          >
            Add to watched list
          </button>
        )}
        <p>
          <em>{plot}</em>
        </p>
        <p>Starring {actors}</p>
        <p>Directed by {director}</p>
      </section>
    </div>
  );
}

function Box({ children }) {
  return <div className="box">{children}</div>;
}

function WatchedBox({ watched }) {
  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>
      {isOpen2 && (
        <>
          <WatchedList watched={watched} />
        </>
      )}
    </div>
  );
}

function Summary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{Math.round(watched.length)} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{Math.round(avgImdbRating)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{Math.round(avgUserRating)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{Math.round(avgRuntime)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedList({ watched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  );
}
