const z = require('zod')

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'El titulo debe ser un string'
  }),
  year: z.number().int().min(1888).max(2024),
  director: z.string(),
  duration: z.number().int().min(1),
  poster: z.string().url({
    message: 'El poster debe ser una URL valida'
  }),
  genre: z.array(
    z.enum(['Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'Sci-Fi', 'Romance'])
  ),
  rate: z.number().min(0).max(10).default(4)
})

function validateMovie (input) {
  return movieSchema.safeParse(input)
}

function validatePartialMovie (input) {
  return movieSchema.partial().safeParse(input)
}

module.exports = { validateMovie, validatePartialMovie }
