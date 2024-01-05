const express = require('express')
const app = express()
const moviesJSON = require('./movies.json')
const crypto = require('node:crypto')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')
const ACCEPTED_ORIGINS = [
  'http://localhost:8080'
]

app.disable('x-powered-by')

const PORT = process.env.PORT ?? 3000

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a mi API' })
})

app.get('/movies', (req, res) => {
  const origin = req.header('Origin')
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }
  const { genre } = req.query
  if (genre) {
    const filterMovies = moviesJSON.filter(
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )
    return res.json(filterMovies)
  }
  res.json(moviesJSON)
})

app.get('/movies/:id', (req, res) => { // path-to-regexp
  const { id } = req.params
  const movie = moviesJSON.find(movie => movie.id === id)
  if (movie) {
    return res.json(movie)
  }
  res.status(404).json({ message: 'Movie not found' })
})

app.post('/movies', (req, res) => {
  const validationResult = validateMovie(req.body)

  if (validationResult.error) {
    return res.status(422).json({ error: JSON.parse(validationResult.error.message) })
  }

  const newMovie = {
    id: crypto.randomUUID(),
    ...validationResult.data
  }

  // Esto no seria rest por que estamos guardan el estado de la aplicacion en memoria
  moviesJSON.push(newMovie)

  res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const validationResult = validatePartialMovie(req.body)

  if (validationResult.error) {
    return res.status(422).json({ error: JSON.parse(validationResult.error.message) })
  }

  const { id } = req.params
  const movieIndex = moviesJSON.findIndex(movie => movie.id === id)

  if (!movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  const updatedMovie = {
    ...moviesJSON[movieIndex],
    ...validationResult.data
  }

  moviesJSON[movieIndex] = updatedMovie

  return res.json(updatedMovie)
})

app.delete('/movies/:id', (req, res) => {
  const origin = req.header('Origin')
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }
  const { id } = req.params
  const movieIndex = moviesJSON.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  moviesJSON.splice(movieIndex, 1)

  return res.json({ message: 'Movie deleted' })
})

app.options('/movies/:id', (req, res) => {
  const origin = req.header('origin')

  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  }
  res.send(200)
})

app.listen(PORT, () => {
  console.log(`app listening at http://localhost:${PORT}`)
})
