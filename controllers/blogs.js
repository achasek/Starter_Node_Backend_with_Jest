const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')
const config = require('../utils/config')

// .then version
// blogsRouter.get('/', (request, response) => {
//   Blog
//     .find({})
//     .then(blogs => {
//       response.json(blogs)
//     })
// })

// async await version
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })

  response.json(blogs)
})

// .then version
// blogsRouter.post('/', (request, response, next) => {
//   const blog = new Blog(request.body)

//   blog
//     .save()
//     .then(result => {
//       response.status(201).json(result)
//     })
//     .catch(error => {
//       next(error)
//     })
// })

// async await version
// the id of user who created the blog is saved in blog.user
// the id of the new blog created is saved in an array user.blogs
blogsRouter.post('/', async (request, response, next) => {
  const body = request.body
  // if middleware is working right, should log token WITHOUT Bearer in front
  console.log(request.token, 'token in ctrl')
  // this is only to make POST testing pass. I could not figure out how to set the request.token in testing to the auth header
  const token = request.token || request.headers.authorization

  const decodedToken = jwt.verify(token, config.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({
      error: 'token invalid'
    })
  }
  console.log("DECODED TOKEN --->", decodedToken) // --------------------
  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user.id
  })

  try {
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    console.log( 'user after post --->', user)
    response.status(201).json(savedBlog)
  }
  catch(error) {
    next(error)
  }
})

// .then version
// blogsRouter.get('/:id', (request, response, next) => {
//   Blog
//     .findById(request.params.id)
//     .then(blog => {
//       response.json(blog)
//     })
//     .catch(error => {
//       next(error)
//     })
// })

// async await version
blogsRouter.get('/:id', async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id)
    if(blog) {
      response.json(blog)
    }
    else {
      response.status(404).send({ error: `blog with id of ${request.params.id} could not be found` })
    }
  }
  catch(error) {
    next(error)
  }
})

// .then version
// blogsRouter.delete('/:id', (request, response, next) => {
//   Blog
//     .findByIdAndRemove(request.params.id)
//     // eslint-disable-next-line no-unused-vars
//     .then(blog => {
//       response.status(204).end()
//     })
//     .catch(error => {
//       next(error)
//     })
// })

// async await version
blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    // since no data is returned by a delete req, you do not need to assign the await keyword
    // to a variable like in other async await functions
    await Blog.findByIdAndRemove(request.params.id)

    response.status(204).end()
  }
  catch(error) {
    next(error)
  }
})

blogsRouter.put('/:id', (request, response, next) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    .then(updatedBlog => {
      response.json(updatedBlog)
    })
    .catch(error => {
      next(error)
    })
})

module.exports = blogsRouter