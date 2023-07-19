const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1, likes: 1 })
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  // initial data being recieved by post request to database
  const { username, name, password } = request.body

  // bcrypt to hash data from payload as to NOT save unhashed password to db
  // saltRounds just determines how many times per/sec password is hashed
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  // only after hashing password can we now instantiate a new User Schema
  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

module.exports = usersRouter