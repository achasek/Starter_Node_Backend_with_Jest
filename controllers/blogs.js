const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

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
  const blogs = await Blog.find({})

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
blogsRouter.post('/', async (request, response, next) => {
  const blog = new Blog(request.body)

  try {
    const savedBlog = await blog.save()
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
    // since no data is returned by a delete req, you do not need to assign the await return
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