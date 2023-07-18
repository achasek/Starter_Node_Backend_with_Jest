const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const helper = require('./test_helper_functions')
const bcrypt = require('bcrypt')
// this sets the timeout for longer. Sometimes, test can fail due to timeout issues
mongoose.set("bufferTimeoutMS", 30000)

const api = supertest(app)

describe('When we call the test database through our backend api for our users', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({ username: 'test user 1', name: 'test name 1', passwordHash })

    await user.save()
  })

  describe('AND we attempt to send a post request to our test db', () => {
    test('Creation of a user is successful given a unique username', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen',
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

      const usernames = usersAtEnd.map(user => user.username)
      expect(usernames).toContain(newUser.username)
    })
  })
})