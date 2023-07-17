const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')

const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')

const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
// mongoose.set('strictQuery', false)
// require('dotenv').config()

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to mongoDB')
  })
  .catch((error) => {
    logger.error('connection to mongoDB failed', error.message)
  })

app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)

app.use(middleware.morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/', (req, res) => {
  res.send({ success : 'server is live' })
})

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app