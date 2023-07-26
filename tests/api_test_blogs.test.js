const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper_functions')
// this sets the timeout for longer. Sometimes, test can fail due to timeout issues
mongoose.set("bufferTimeoutMS", 30000)

// superagent object has methods used to make HTTP reqs to server
const api = supertest(app)

let token = ''

beforeAll(async () => {
  const user = {
    username: 'testUser1',
    password: 'secret'
  }

  const response = await api
    .post('/api/login')
    .send(user)

  token = response.body.token;
})

// this initializes our test db everytime before this test is ran
beforeEach(async () => {
  await Blog.deleteMany({})

  // creates an array of newly instantiated Mongoose documents of our blogs
  const noteObjects = helper.initialBlogs
    .map(blog => new Blog(blog))
  // creates an array of promises, NOT of our blogs
  const promiseArray = noteObjects.map(note => note.save())
  // awaits until the entire above array of promsies is resolved
  await Promise.all(promiseArray)

  // another solution to handle awaiting for ALL promises for each blog document
  // forEach does not work here; must be for-of loop
  //   for (let blog of helper.initialBlogs) {
  //     let blogObject = new Blog(blog)
  //     await blogObject.save()
  //   }

  // also works in only 2 lines
  //   await Blog.deleteMany({})
  //   await Blog.insertMany(helper.initialBlogs)

})

describe('When we call the test database through our backend api for our blogs', () => {
  describe('AND initial blogs are saved and all fetched via get request', () => {
    test('blogs are returned as json', async () => {
      await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    test('all of our blogs in intialBlogs are returned', async () => {
      const response = await api.get('/api/blogs')

      expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    test('a specifc blog can be fetched via HTTP get and is within the response', async () => {
      const response = await api.get('/api/blogs')

      const titles = response.body.map(blog => blog.title)
      expect(titles).toContain(
        'test title 2'
      )
    })
  })



  describe('AND we attempt to send a post request to our test db', () => {

    test('a valid blog can be added', async () => {
      console.log(token, 'test token in post test')

      const newBlog = {
        title: 'test title 3',
        author: 'test author 3',
        url: 'test3.com',
        likes: 15,
      }

      // this just checks the header type and status code returned
      await api
        .post('/api/blogs')
        .set('Authorization', token)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      // this actually checks to see if the new blog is added
      // prior to helper functions being added
      // const response = await api.get('/api/blogs')
      // expect(response.body).toHaveLength(helper.initialBlogs.length + 1)

      const blogsAfterPost = await helper.blogsInDb()
      expect(blogsAfterPost).toHaveLength(helper.initialBlogs.length + 1)

      const titles = blogsAfterPost.map(blog => blog.title)

      expect(titles).toContain(
        'test title 3'
      )
    })

    test('blog without title or url is not allowed to be added', async () => {
      const newBlog = {
        title: '',
        author: 'test author 3',
        url: '',
        likes: 15,
        // REMEMBER: for these tests that are configured to use the TEST DB
        // and not the reg DB, to use an id of a user currently in the TEST DB and not the the reg DB
        // if POST tests not working, go check DB and grab an id from test_users
        // DO NOT CONFUSE TEST DB WITH PRODUCTION DB
        // user: '64b9a778cf56247fe7790d03'
      }

      // just checks for status code 400, does not check data
      await api
        .post('/api/blogs')
        .set('Authorization', token)
        .send(newBlog)
        .expect(400)

      // this checks data to ensure blog was not added
      const blogsAfterPost = await helper.blogsInDb()

      expect(blogsAfterPost).toHaveLength(helper.initialBlogs.length)
    })

    test('blog without likes specifed during creation has default value of 0', async () => {
      const newBlog = {
        title: 'test title 3',
        author: 'test author 3',
        url: 'test3.com',
      }

      // just checks for status code 400, does not check data
      await api
        .post('/api/blogs')
        .set('Authorization', token)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      // this checks data to ensure blog was not added
      const blogsAfterPost = await helper.blogsInDb()

      expect(blogsAfterPost).toHaveLength(helper.initialBlogs.length + 1)

      expect(blogsAfterPost[2].likes).toEqual(0)
    })
  })



  describe('AND we send a get request to our test db and fetch a specific document in our collection', () => {
    test('a specific blog can be fetched via get req and viewed', async () => {
      const blogsBeforeGet = await helper.blogsInDb()

      const blogToView = blogsBeforeGet[0]

      const resultBlog = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      // whenever dealing with get reqs that return JSON, you want to add .body
      // to get the data you want, like below with resultBlog.body, since result blog
      // is a fulfilled promise that gets a JSON object
      expect(resultBlog.body).toEqual(blogToView)
    })

    test('fails with statuscode 404 if blog does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId()

      await api
        .get(`/api/blogs/${validNonexistingId}`)
        .expect(404)
    })

    test('the unique identifier for a single document is named id and not mongodbs default _id', async () => {
      const blogsBeforeGet = await helper.blogsInDb()

      const blogToExamine = blogsBeforeGet[0]

      const resultBlog = await api
        .get(`/api/blogs/${blogToExamine.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(resultBlog.body.id).toBeDefined()
    })

    test('mongodbs default _id is properly deleted with .set method in blog model', async () => {
      const blogsBeforeGet = await helper.blogsInDb()

      const blogToExamine = blogsBeforeGet[0]

      const resultBlog = await api
        .get(`/api/blogs/${blogToExamine.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(resultBlog.body._id).toBeUndefined()
    })
  })



  describe('AND we send a delete request to our test db', () => {
    test('a blog can be successfully deleted', async () => {
      const blogsBeforeGet = await helper.blogsInDb()
      const blogToDelete = blogsBeforeGet[0]


      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)
      // delete has no data, so no content-type for this one

      const blogsAfterPost = await helper.blogsInDb()

      expect(blogsAfterPost).toHaveLength(
        helper.initialBlogs.length - 1
      )

      const titles = blogsAfterPost.map(blog => blog.title)

      expect(titles).not.toContain(blogToDelete.title)
    })
  })



  describe('AND we send a PUT request to our test db', () => {
    test('a single document is successfully updated and we get status code 200, length of blogs array is unchanged, and likes has been updated', async () => {
      const blogsBeforePut = await helper.blogsInDb()
      const blogToUpdate = blogsBeforePut[0]

      const updatedBlog = {
        title: 'test title 1',
        author: 'test author 1',
        url: 'test.com',
        likes: 50
      }

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .expect('Content-Type', /application\/json/)
        .send(updatedBlog)
        .expect(200)

      const blogsAfterPut = await helper.blogsInDb()

      expect(blogsAfterPut).toHaveLength(helper.initialBlogs.length)

      expect(blogsAfterPut[0].likes).toEqual(50)
    })
  })

})





// with the added teardown.js file, you dont need the below block,
// but im leaving it here to show what would need to be here if that file wasnt
// afterAll(async () => {
//   await mongoose.connection.close()
// })