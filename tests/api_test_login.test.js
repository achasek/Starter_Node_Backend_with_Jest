const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
// const helper = require('./test_helper_functions')
const bcrypt = require('bcrypt')
// this sets the timeout for longer. Sometimes, test can fail due to timeout issues
mongoose.set("bufferTimeoutMS", 30000)

const api = supertest(app)

describe('When we call the test database through our backend api login route when there is 1 user in the db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({ username: 'testUser1', passwordHash })

    await user.save()
  })

  test('AND we attempt to login, our backend generataes a valid token in the authorization header', async () => {
    const user = {
      username: 'testUser1',
      password: 'secret'
    }

    const response = await api
      .post('/api/login')
      .send(user)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.token).toBeDefined()
  })

  test('AND we attempt to login with invalid credentials, our backend responds with proper error code and does not grant a token', async () => {
    const user = {
      username: 'testUser1',
      password: 'wrongPassword'
    }

    const response = await api
      .post('/api/login')
      .send(user)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body.token).toBeUndefined()
  })
})